import * as swisseph from 'swisseph';
import path from 'path';
import { NextResponse } from 'next/server';

swisseph.swe_set_ephe_path(path.join(process.cwd(), 'ephe'));
swisseph.swe_set_sid_mode(1); // Lahiri

const getJulDay = (year: number, month: number, day: number, hour: number): Promise<number> => {
  return new Promise((resolve) => {
    swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL, (result: any) => {
      resolve(typeof result === 'number' ? result : result.julday);
    });
  });
}

async function getAyanamsa(julday: number): Promise<number> {
  return new Promise((resolve, reject) => {
    swisseph.swe_get_ayanamsa_ut(julday, (result: any) => {
      if (result.error) reject(new Error(result.error));
      else resolve(result.ayanamsa);
    });
  });
}

const getCalc = (julday: number, body: number, flags: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    swisseph.swe_calc_ut(julday, body, flags, (result: any) => {
      if (result.error) reject(new Error(result.error));
      else resolve(result);
    });
  });
}

export async function GET() {
  for (let i = 0; i < (365 * 5); i++) {
    const testDate = new Date();
    testDate.setUTCDate(testDate.getUTCDate() + i);
    testDate.setUTCHours(12, 0, 0, 0);

    const year = testDate.getUTCFullYear();
    const month = testDate.getUTCMonth() + 1;
    const day = testDate.getUTCDate();
    const hour = testDate.getUTCHours() + testDate.getUTCMinutes() / 60 + testDate.getUTCSeconds() / 3600;

    const julday = await getJulDay(year, month, day, hour);
    await getAyanamsa(julday);

    const flags = swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED | swisseph.SEFLG_SWIEPH;
    const sunData = await getCalc(julday, swisseph.SE_SUN, flags);
    const moonData = await getCalc(julday, swisseph.SE_MOON, flags);
    const sunLong = sunData.longitude;
    const moonLong = moonData.longitude;

    const nakshatraIndex = Math.floor(moonLong / (360 / 27));

    const istTime = new Date(testDate.getTime() + (5.5 * 60 * 60 * 1000));
    let dayIndex = istTime.getUTCDay();
    if (istTime.getUTCHours() < 6) dayIndex = (dayIndex - 1 + 7) % 7;

    let luniSolarDiff = (moonLong - sunLong) % 360;
    if (luniSolarDiff < 0) luniSolarDiff += 360;
    const tithiIndex = Math.floor(luniSolarDiff / 12);
    const pakshaTithi = (tithiIndex % 15) + 1;

    if (dayIndex === 1 && nakshatraIndex === 3 && pakshaTithi === 3) {
      return NextResponse.json({
        success: true,
        target_found: "Monday + Rohini + Tritiya",
        utc_timestamp: testDate.toUTCString(),
        moon_degree: moonLong,
        sun_degree: sunLong,
        tithi_index: pakshaTithi
      });
    }
  }

  return NextResponse.json({
    success: false,
    message: "Target combination not found within the search horizon."
  });
}
