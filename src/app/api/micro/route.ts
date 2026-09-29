import swisseph from 'swisseph';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

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
  const targetDateParam = request.nextUrl.searchParams.get('date');
  const targetDate = targetDateParam 
    ? new Date(targetDateParam) 
    : new Date();

  targetDate.setUTCHours(0, 0, 0, 0);

  const year = targetDate.getUTCFullYear();
  const month = targetDate.getUTCMonth() + 1;
  const day = targetDate.getUTCDate();

  const viableSlots: any[] = [];
  const lat = 28.6139;
  const lon = 77.2090;
  const flags = swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED | swisseph.SEFLG_MOSEPH;

  for (let slot = 0; slot < 96; slot++) {
    const hour = Math.floor(slot / 4);
    const minute = (slot % 4) * 15;
    const testHour = hour + minute / 60;

    const julday = await getJulDay(year, month, day, testHour);
    const ayanamsa = await getAyanamsa(julday);

    const moonResult = await getCalc(julday, swisseph.SE_MOON, flags);
    const moonLong = moonResult.longitude || moonResult[0] || 0;

    const housesResult = await getHouses(julday, lat, lon);
    const ascTropical = housesResult.ascendant || housesResult.house?.[1] || housesResult[1] || 0;
    let lagna = (ascTropical - ayanamsa + 360) % 360;

    const nakshatraIndex = Math.floor(moonLong / (360 / 27));
    const lagnaSign = Math.floor(lagna / 30);

    // Hard-coded Maitra Muhurta logic (favorable for "Paying Debts")
    const isMaitraNakshatra = [0, 7, 8, 15, 24].includes(nakshatraIndex);
    const isMaitraTithi = [4, 9, 14].includes((Math.floor(((moonLong - (await getCalc(julday, swisseph.SE_SUN, flags)).longitude || 0) % 360) / 12) % 15) + 1);
    const isMaitraVara = [0, 1, 2, 4, 5, 6].includes(new Date(year, month - 1, day).getUTCDay());

    const isFavorable = isMaitraNakshatra && isMaitraTithi && isMaitraVara;

    viableSlots.push({
      slot: slot,
      time: `${hour.toString().padStart(2, '0')}:${(minute).toString().padStart(2, '0')}`,
      nakshatra: nakshatraIndex,
      lagna_sign: lagnaSign,
      favorable: isFavorable
    });
  }

  return NextResponse.json({
    date: targetDate.toISOString().split('T')[0],
    slots: viableSlots
  });
}
