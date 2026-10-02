import { NextRequest, NextResponse } from 'next/server';
import swisseph from 'swisseph';
import path from 'path';
import tzLookup from 'tz-lookup';

const getJulDay = (year: number, month: number, day: number, hour: number): Promise<number> => new Promise(r => swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL, (res: any) => r(res.julday || res)));
const getAyanamsa = (julday: number): Promise<number> => new Promise(r => swisseph.swe_get_ayanamsa_ut(julday, (res: any) => r(res.ayanamsa || res)));
const getHouses = (julday: number, lat: number, lon: number): Promise<any> => new Promise((r, rej) => swisseph.swe_houses(julday, lat, lon, 'W', (res: any) => res.error ? rej(res.error) : r(res)));

const RASI_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

export async function GET(request: NextRequest) {
  try {
    swisseph.swe_set_ephe_path(path.join(process.cwd(), 'node_modules', 'swisseph', 'ephe'));
    swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

    const dateParam = request.nextUrl.searchParams.get('date');
    const lat = parseFloat(request.nextUrl.searchParams.get('lat') || '51.6242');
    const lon = parseFloat(request.nextUrl.searchParams.get('lon') || '0.0604');
    
    if (!dateParam) return NextResponse.json({ error: "No date provided" }, { status: 400 });

    const timeZone = tzLookup(lat, lon);
    const baseDate = new Date(dateParam);
    const windows = [];

    for (let i = 0; i < 48; i++) {
      const scanDate = new Date(baseDate);
      
      // FIX: Bulletproof Timezone Offset Calculation
      const dateStr = scanDate.toLocaleString('en-US', { timeZone });
      const utcStr = scanDate.toLocaleString('en-US', { timeZone: 'UTC' });
      const offsetHours = (new Date(dateStr).getTime() - new Date(utcStr).getTime()) / 3600000;

      const localHour = i * 0.5;
      const targetUtcHour = localHour - offsetHours;
      
      // FIX: Safe minute conversion to handle negative targetUtcHour calculations
      const totalUtcMinutes = Math.round(targetUtcHour * 60);
      scanDate.setUTCHours(0, totalUtcMinutes, 0, 0);

      const y = scanDate.getUTCFullYear();
      const m = scanDate.getUTCMonth() + 1;
      const d = scanDate.getUTCDate();
      const h = scanDate.getUTCHours() + scanDate.getUTCMinutes() / 60;

      const julday = await getJulDay(y, m, d, h);
      const ayanamsa = await getAyanamsa(julday);
      const housesRes: any = await getHouses(julday, lat, lon);
      
      const ascTropical = housesRes.ascendant || housesRes.house?.[1] || housesRes[1] || 0;
      const ascSidereal = (ascTropical - ayanamsa + 360) % 360;
      const lagnaIndex = Math.floor(ascSidereal / 30);
      const lagnaName = RASI_NAMES[lagnaIndex];

      const favorableLagnas = ["Taurus", "Gemini", "Cancer", "Virgo", "Libra", "Sagittarius", "Pisces"];
      const isFavorable = favorableLagnas.includes(lagnaName);

      const timeString = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', timeZone }).format(scanDate);

      windows.push({
        start_time: timeString,
        end_time: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', timeZone }).format(new Date(scanDate.getTime() + 30 * 60000)),
        lagna_name: lagnaName,
        favorable_lagna: isFavorable,
        combination_active: isFavorable ? 'Śubha Lagna' : ''
      });
    }

    const collapsed = [];
    let current = windows[0];
    for (let i = 1; i < windows.length; i++) {
      if (windows[i].lagna_name === current.lagna_name) {
        current.end_time = windows[i].end_time;
      } else {
        collapsed.push(current);
        current = windows[i];
      }
    }
    collapsed.push(current);

    return NextResponse.json({ windows: collapsed });
  } catch (error: any) {
    return NextResponse.json({ error: "Micro API Crash", message: error.message || String(error) }, { status: 500 });
  }
}
