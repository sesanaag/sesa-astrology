import { NextRequest, NextResponse } from 'next/server';
import swisseph from 'swisseph';
import path from 'path';
import { ACTIVITY_LIBRARY } from '@/lib/engine/activities';
import tzLookup from 'tz-lookup';

const getJulDay = (year: number, month: number, day: number, hour: number): Promise<number> => new Promise((resolve) => swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL, (r: any) => resolve(r.julday || r)));
const getCalc = (julday: number, planet: number, flags: number): Promise<any> => new Promise((resolve, reject) => swisseph.swe_calc_ut(julday, planet, flags, (r: any) => r.error ? reject(r.error) : resolve(r)));

// --- CHAPTER 9: COMBINED YOGA MATRICES ---
const isAmrita = (v: number, t: number) => {
  const amritaMap: Record<number, number[]> = {0:[1,6,11], 1:[2,7,12], 2:[1,6,11], 3:[3,8,13], 4:[4,9,14], 5:[2,7,12], 6:[5,10,15]};
  return amritaMap[v]?.includes(t);
};
const isSiddhaVT = (v: number, t: number) => {
  const siddhaMap: Record<number, number[]> = {5:[1,6,11], 3:[2,7,12], 2:[3,8,13], 6:[4,9,14], 4:[5,10,15]};
  return siddhaMap[v]?.includes(t);
};
const isDagdhaVT = (v: number, t: number) => {
  const dagdhaMap: Record<number, number[]> = {0:[12], 1:[11], 2:[5], 3:[2,3], 4:[6], 5:[8], 6:[9]};
  return dagdhaMap[v]?.includes(t);
};
const isVishaVT = (v: number, t: number) => {
  const vishaMap: Record<number, number[]> = {0:[4], 1:[6], 2:[7], 3:[2], 4:[8], 5:[9], 6:[7]};
  return vishaMap[v]?.includes(t);
};
const isYamaghanta = (v: number, n: number) => {
  const yamaMap: Record<number, number> = {0:8, 1:14, 2:4, 3:17, 4:1, 5:2, 6:11};
  return yamaMap[v] === n;
};
const isDagdhaVN = (v: number, n: number) => {
  const dagdhaNMap: Record<number, number> = {0:1, 1:12, 2:20, 3:22, 4:11, 5:17, 6:26};
  return dagdhaNMap[v] === n;
};
const isSarvarthaSiddhi = (v: number, n: number) => {
  const ssMap: Record<number, number[]> = {
    0: [0, 7, 12, 11, 18, 20, 25], 1: [3, 4, 7, 16, 21], 2: [0, 2, 8, 25],
    3: [2, 3, 4, 12, 16], 4: [0, 6, 7, 16, 26], 5: [0, 6, 16, 21, 26], 6: [3, 14, 21] 
  };
  return ssMap[v]?.includes(n);
};

export async function GET(request: NextRequest) {
  try {
    swisseph.swe_set_ephe_path(path.join(process.cwd(), 'node_modules', 'swisseph', 'ephe'));
    swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

    const activityKey = request.nextUrl.searchParams.get('activity');
    const natalStar = parseInt(request.nextUrl.searchParams.get('natal_nakshatra') || '11', 10);
    const startDateParam = request.nextUrl.searchParams.get('startDate');
    const lat = parseFloat(request.nextUrl.searchParams.get('lat') || '51.6242');
    const lon = parseFloat(request.nextUrl.searchParams.get('lon') || '0.0604');
    
    if (!activityKey || !ACTIVITY_LIBRARY[activityKey]) return NextResponse.json({ error: "Invalid activity key" }, { status: 400 });

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

      const diff = (moonLong - sunLong + 360) % 360;
      const tithiIndex = Math.floor(diff / 12) + 1;
      const tithiPhaseNum = tithiIndex <= 15 ? tithiIndex : tithiIndex - 15;
      const nakshatraIndex = Math.floor(moonLong / (360 / 27));
      
      const localDateString = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long' }).format(scanDate);
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const varaIndex = daysOfWeek.indexOf(localDateString);

      const isVaraFav = activeRule.varas.includes(varaIndex);
      const isTithiFav = activeRule.tithis.includes(tithiIndex) || activeRule.tithis.includes(tithiPhaseNum);
      const isNakFav = activeRule.nakshatras.includes(nakshatraIndex);

      const tara = (nakshatraIndex - natalStar + 27) % 27;
      const taraBala = tara % 9;
      const isTaraFav = ![2, 4, 6].includes(taraBala);

      let baseScore = 0;
      if (isVaraFav) baseScore++;
      if (isTithiFav) baseScore++;
      if (isNakFav) baseScore++;
      if (isTaraFav) baseScore++;

      // CHAPTER 9 OVERRIDES
      let comboName = '';
      let comboType = 0;

      if (isDagdhaVT(varaIndex, tithiPhaseNum) || isDagdhaVN(varaIndex, nakshatraIndex)) {
        comboName = 'Dagdha Yoga (Burnt / Destructive)'; comboType = -1;
      } else if (isVishaVT(varaIndex, tithiPhaseNum)) {
        comboName = 'Viṣa Yoga (Poisonous)'; comboType = -1;
      } else if (isYamaghanta(varaIndex, nakshatraIndex)) {
        comboName = 'Yamaghaṇṭa Yoga (Death)'; comboType = -1;
      } else if (isAmrita(varaIndex, tithiPhaseNum)) {
        comboName = 'Amṛta Yoga (Immortal)'; comboType = 1;
      } else if (isSarvarthaSiddhi(varaIndex, nakshatraIndex)) {
        comboName = 'Sarvārtha Siddhi (Complete Success)'; comboType = 1;
      } else if (isSiddhaVT(varaIndex, tithiPhaseNum)) {
        comboName = 'Siddha Yoga (Accomplished)'; comboType = 1;
      }

      let finalScore = baseScore;
      if (comboType === 1) finalScore += 2;
      if (comboType === -1) finalScore -= 3;

      let status = '';
      if (comboType === -1 && baseScore >= 2) {
        status = 'DANGER'; // Throw a red flag if it looked okay but has hidden poison
      } else if (finalScore >= 4) {
        status = 'EXCELLENT';
      } else if (finalScore === 3) {
        status = 'OPTIMAL';
      }

      if (status === 'EXCELLENT' || status === 'OPTIMAL' || status === 'DANGER') {
        windows.push({
          date: scanDate.toISOString(),
          vara_index: varaIndex,
          tithi_index: tithiIndex,
          nakshatra_index: nakshatraIndex,
          combo_name: comboName,
          status: status
        });
      }
    }

    return NextResponse.json({ viable_windows: windows });

  } catch (error: any) {
    return NextResponse.json({ error: "API Crash", message: error.message || String(error) }, { status: 500 });
  }
}
