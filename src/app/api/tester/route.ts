import * as swisseph from 'swisseph';
import path from 'path';
import { NextResponse } from 'next/server';

swisseph.swe_set_ephe_path(path.join(process.cwd(), 'ephe'));
swisseph.swe_set_sid_mode(1); // Lahiri

async function getJulDay(date: Date): Promise<number> {
  return new Promise((resolve, reject) => {
    const utc = date.getTime() / 1000;
    swisseph.swe_utc_to_jd(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      1,
      (result: any) => {
        if (result.error) reject(new Error(result.error));
        else resolve(result.julianDay);
      }
    );
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

async function getCalc(julday: number, body: number): Promise<any> {
  return new Promise((resolve, reject) => {
    swisseph.swe_calc_ut(julday, body, swisseph.SEFLG_SIDEREAL, (result: any) => {
      if (result.error) reject(new Error(result.error));
      else resolve(result);
    });
  });
}

export async function GET() {
  for (let i = 0; i < 365; i++) {
    const testDate = new Date();
    testDate.setUTCDate(testDate.getUTCDate() + i);
    testDate.setUTCHours(12, 0, 0, 0);

    const julday = await getJulDay(testDate);
    await getAyanamsa(julday);

    const sunData = await getCalc(julday, swisseph.SE_SUN);
    const moonData = await getCalc(julday, swisseph.SE_MOON);
    const sunLong = sunData.longitude;
    const moonLong = moonData.longitude;

    const nakshatraIndex = Math.floor(moonLong / (360 / 27));

    const istTime = new Date(testDate.getTime() + (5.5 * 60 * 60 * 1000));
    let dayIndex = istTime.getUTCDay();
    if (istTime.getUTCHours() < 6) dayIndex = (dayIndex - 1 + 7) % 7;

    if (dayIndex === 4 && nakshatraIndex === 7) {
      return NextResponse.json({
        success: true,
        target_found: "Guru Pushya Yoga",
        utc_timestamp: testDate.toUTCString(),
        moon_degree: moonLong,
        sun_degree: sunLong
      });
    }
  }
}
