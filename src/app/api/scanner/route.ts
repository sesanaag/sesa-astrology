import { NextRequest, NextResponse } from 'next/server';
import swisseph from 'swisseph';
import path from 'path';
import { ACTIVITY_LIBRARY } from '@/lib/engine/activities';
import tzLookup from 'tz-lookup';

const getJulDay = (year: number, month: number, day: number, hour: number): Promise<number> => {
  return new Promise((resolve) => swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL, (r: any) => resolve(r.julday || r)));
};
const getCalc = (julday: number, planet: number, flags: number): Promise<any> => {
  return new Promise((resolve, reject) => swisseph.swe_calc_ut(julday, planet, flags, (r: any) => r.error ? reject(r.error) : resolve(r)));
};

export async function GET(request: NextRequest) {
  try {
    swisseph.swe_set_ephe_path(path.join(process.cwd(), 'node_modules', 'swisseph', 'ephe'));
    swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

    const activityKey = request.nextUrl.searchParams.get('activity');
    const natalStar = parseInt(request.nextUrl.searchParams.get('natal_nakshatra') || '11', 10);
    const startDateParam = request.nextUrl.searchParams.get('startDate');
    const format = request.nextUrl.searchParams.get('format');
    const lat = parseFloat(request.nextUrl.searchParams.get('lat') || '51.6242');
    const lon = parseFloat(request.nextUrl.searchParams.get('lon') || '0.0604');
    
    if (!activityKey || !ACTIVITY_LIBRARY[activityKey]) {
      return NextResponse.json({ error: "Invalid activity key provided." }, { status: 400 });
    }

    const activeRule = ACTIVITY_LIBRARY[activityKey];
    const BASE_DATE = startDateParam ? new Date(startDateParam) : new Date();
    const windows = [];
    
    const timeZone = tzLookup(lat, lon);
    const flags = swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED | swisseph.SEFLG_MOSEPH;

    for (let i = 0; i < 60; i++) {
      const scanDate = new Date(BASE_DATE);
      scanDate.setUTCDate(scanDate.getUTCDate() + i);
      scanDate.setUTCHours(12, 0, 0, 0);

      const dateStr = scanDate.toLocaleString('en-US', { timeZone });
      const utcStr = scanDate.toLocaleString('en-US', { timeZone: 'UTC' });
      const offsetHours = (new Date(dateStr).getTime() - new Date(utcStr).getTime()) / 3600000;

      const targetUtcHour = 12 - offsetHours;
      const totalUtcMinutes = Math.round(targetUtcHour * 60);
      scanDate.setUTCHours(0, totalUtcMinutes, 0, 0);

      const y = scanDate.getUTCFullYear();
      const m = scanDate.getUTCMonth() + 1;
      const d = scanDate.getUTCDate();
      
      const julday = await getJulDay(y, m, d, targetUtcHour);
      const moonRes: any = await getCalc(julday, swisseph.SE_MOON, flags);
      const sunRes: any = await getCalc(julday, swisseph.SE_SUN, flags);
      
      const moonLong = moonRes.longitude || moonRes[0] || 0;
      const sunLong = sunRes.longitude || sunRes[0] || 0;

      const luniSolarDiff = (moonLong - sunLong + 360) % 360;
      const tithiIndex = Math.floor(luniSolarDiff / 12) + 1;
      const nakshatraIndex = Math.floor(moonLong / (360 / 27));
      
      const localDateString = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long' }).format(scanDate);
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const varaIndex = daysOfWeek.indexOf(localDateString);

      const isVaraFav = activeRule.varas.includes(varaIndex);
      const isTithiFav = activeRule.tithis.includes(tithiIndex) || activeRule.tithis.includes(tithiIndex % 15 || 15);
      const isNakFav = activeRule.nakshatras.includes(nakshatraIndex);

      const tara = (nakshatraIndex - natalStar + 27) % 27;
      const taraBala = tara % 9;
      const isTaraFav = ![2, 4, 6].includes(taraBala);

      let score = 0;
      if (isVaraFav) score++;
      if (isTithiFav) score++;
      if (isNakFav) score++;
      if (isTaraFav) score++;

      let status = '';
      if (score === 4) status = 'EXCELLENT';
      else if (score === 3) status = 'OPTIMAL';
      else if (score === 2) status = 'NEUTRAL';

      if (score >= 2) {
        windows.push({
          date: scanDate.toISOString(),
          vara_index: varaIndex,
          tithi_index: tithiIndex,
          nakshatra_index: nakshatraIndex,
          yoga: 'Siddhi',
          status: status
        });
      }
    }

    if (format === 'ics') {
      let ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nCALSCALE:GREGORIAN\r\n";
      for (const w of windows) {
        if (w.status === 'NEUTRAL') continue; 
        const dt = w.date.replace(/[-:]/g, '').split('.')[0] + 'Z';
        ics += `BEGIN:VEVENT\r\nDTSTART:${dt}\r\nDTEND:${dt}\r\nSUMMARY:Jyotish Window: ${activityKey}\r\nEND:VEVENT\r\n`;
      }
      ics += "END:VCALENDAR\r\n";
      return new NextResponse(ics, { headers: { 'Content-Type': 'text/calendar', 'Content-Disposition': `attachment; filename="jyotish_${activityKey}.ics"` } });
    }

    return NextResponse.json({ viable_windows: windows });

  } catch (error: any) {
    return NextResponse.json({ error: "API Crash", message: error.message || String(error) }, { status: 500 });
  }
}
