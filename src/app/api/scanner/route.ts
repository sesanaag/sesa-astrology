import swisseph from 'swisseph';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { evaluateMuhurta } from '@/lib/engine/verdict';
import { ACTIVITY_LIBRARY } from '@/lib/engine/activities';

swisseph.swe_set_ephe_path(path.join(process.cwd(), 'node_modules/swisseph/ephe'));
swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

const getJulDay = (year: number, month: number, day: number, hour: number): Promise<number> => {
  return new Promise((resolve) => {
    swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL, (result: any) => {
      resolve(typeof result === 'number' ? result : result.julday);
    });
  });
};

const getAyanamsa = (julday: number): Promise<number> => {
  return new Promise((resolve) => {
    swisseph.swe_get_ayanamsa_ut(julday, (result: any) => {
      resolve(typeof result === 'number' ? result : result.ayanamsa);
    });
  });
};

const getCalc = (julday: number, planet: number, flags: number) => {
  return new Promise((resolve, reject) => {
    swisseph.swe_calc_ut(julday, planet, flags, (result: any) => {
      if (result.error) reject(result.error);
      else resolve(result);
    });
  });
};

const getHouses = (julday: number, lat: number, lon: number) => {
  return new Promise((resolve, reject) => {
    swisseph.swe_houses_ex(julday, swisseph.SEFLG_SIDEREAL, lat, lon, 'W', (result: any) => {
      if (result.error) reject(result.error);
      else resolve(result);
    });
  });
};

export async function GET(request: NextRequest) {
  const startDateParam = request.nextUrl.searchParams.get('startDate');
  const BASE_DATE = startDateParam ? new Date(startDateParam) : new Date(Date.now());
  const format = request.nextUrl.searchParams.get('format');
  const activityKey = request.nextUrl.searchParams.get('activity');
  const activeRule = activityKey && ACTIVITY_LIBRARY[activityKey] ? ACTIVITY_LIBRARY[activityKey] : null;

  const viableWindows: any[] = [];

  for (let i = 0; i < 60; i++) {
    const testDate = new Date(BASE_DATE);
    testDate.setUTCDate(testDate.getUTCDate() + i);
    testDate.setUTCHours(12, 0, 0, 0);

    const year = testDate.getUTCFullYear();
    const month = testDate.getUTCMonth() + 1;
    const day = testDate.getUTCDate();
    const hour = 12;

    const julday = await getJulDay(year, month, day, hour);
    const ayanamsa = await getAyanamsa(julday);

    const flags = swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED | swisseph.SEFLG_MOSEPH;

    const moonResult: any = await getCalc(julday, swisseph.SE_MOON, flags);
    const moonLong = moonResult.longitude || moonResult[0] || 0;

    const sunResult: any = await getCalc(julday, swisseph.SE_SUN, flags);
    const sunLong = sunResult.longitude || sunResult[0] || 0;

    const marsResult: any = await getCalc(julday, swisseph.SE_MARS, flags);
    const marsLong = marsResult.longitude || marsResult[0] || 0;

    const venResult: any = await getCalc(julday, swisseph.SE_VENUS, flags);
    const venLong = venResult.longitude || venResult[0] || 0;

    const housesResult: any = await getHouses(julday, 28.6139, 77.2090);
    const ascTropical = housesResult.ascendant || housesResult.house?.[1] || housesResult[1] || 0;
    let lagna = (ascTropical - ayanamsa + 360) % 360;

    const lagnaSign = Math.floor(lagna / 30);
    const marsSign = Math.floor(marsLong / 30);
    const venSign = Math.floor(venLong / 30);
    const marsHouse = (marsSign - lagnaSign + 12) % 12 + 1;
    const venHouse = (venSign - lagnaSign + 12) % 12 + 1;

    const nakshatraIndex = Math.floor(moonLong / (360 / 27));

    const istTime = new Date(testDate.getTime() + (5.5 * 60 * 60 * 1000));
    let dayIndex = istTime.getUTCDay();
    if (istTime.getUTCHours() < 6) {
      dayIndex = (dayIndex - 1 + 7) % 7;
    }

    let luniSolarDiff = (moonLong - sunLong) % 360;
    if (luniSolarDiff < 0) luniSolarDiff += 360;

    const tithiIndex = Math.floor(luniSolarDiff / 12);
    const karanaIndex = Math.floor(luniSolarDiff / 6);

    const userNatalStar = parseInt(request.nextUrl.searchParams.get('natal_nakshatra') || '8', 10);
    const verdict = evaluateMuhurta(tithiIndex, dayIndex, karanaIndex, marsHouse, venHouse, nakshatraIndex, userNatalStar);

    if (!["EXCELLENT", "NEUTRAL"].includes(verdict.status) || !verdict.isTaraFavorable) continue;

    const pakshaTithi = (tithiIndex % 15) + 1;
    if (activeRule) {
      if (!activeRule.varas.includes(dayIndex) || 
          !activeRule.tithis.includes(pakshaTithi) || 
          !activeRule.nakshatras.includes(nakshatraIndex)) {
        continue;
      }
    }

    viableWindows.push({
      date: testDate.toUTCString(),
      tithi_index: tithiIndex,
      nakshatra_index: nakshatraIndex,
      vara_index: dayIndex,
      status: verdict.status,
      yoga: verdict.compoundYogaName
    });
  }

  if (format === 'ics') {
    let icsString = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Jyotish Engine//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ].join('\r\n') + '\r\n';

    viableWindows.forEach((win) => {
      const startDate = new Date(win.date);
      const endDate = new Date(startDate.getTime() + (60 * 60 * 1000));
      
      const formatIcsDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      icsString += [
        'BEGIN:VEVENT',
        `UID:${startDate.getTime()}@jyotishengine`,
        `DTSTAMP:${formatIcsDate(new Date(BASE_DATE))}`,
        `DTSTART:${formatIcsDate(startDate)}`,
        `DTEND:${formatIcsDate(endDate)}`,
        `SUMMARY:[ ${win.status} ]${activeRule ? activeRule.name : 'Jyotish'} Window`,
        `DESCRIPTION:Compound Yoga: ${win.yoga}\\nNakshatra Index: ${win.nakshatra_index}\\nTithi Index: ${win.tithi_index}`,
        'END:VEVENT'
      ].join('\r\n') + '\r\n';
    });

    icsString += 'END:VCALENDAR';

    return new NextResponse(icsString, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="muhurta.ics"'
      }
    });
  }

  return NextResponse.json({ scanned_days: 60, viable_windows: viableWindows });
}
