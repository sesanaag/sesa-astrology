import swisseph from 'swisseph';
import path from 'path';
import { ACTIVITY_LIBRARY } from './activities';

swisseph.swe_set_ephe_path(path.join(process.cwd(), 'node_modules/swisseph/ephe'));
swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

const RASI_NAMES = [
  "Aries (Mesha)", "Taurus (Vrishabha)", "Gemini (Mithuna)", "Cancer (Karka)", 
  "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrishchika)", 
  "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"
];

const getJulDay = (year: number, month: number, day: number, hour: number): Promise<number> => {
  return new Promise((resolve) => swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL, (r: any) => resolve(r.julday || r)));
};

const getAyanamsa = (julday: number): Promise<number> => {
  return new Promise((resolve) => swisseph.swe_get_ayanamsa_ut(julday, (r: any) => resolve(r.ayanamsa || r)));
};

const getCalc = (julday: number, planet: number, flags: number): Promise<any> => {
  return new Promise((resolve, reject) => swisseph.swe_calc_ut(julday, planet, flags, (r: any) => r.error ? reject(r.error) : resolve(r)));
};

const getHouses = (julday: number, lat: number, lon: number): Promise<any> => {
  return new Promise((resolve, reject) => swisseph.swe_houses_ex(julday, swisseph.SEFLG_SIDEREAL, lat, lon, 'W', (r: any) => r.error ? reject(r.error) : resolve(r)));
};

// THIS IS THE FUNCTION THE AI AGENT WILL CALL
export async function scanMicroTimeline(dateStr: string, activityKey: string, lat: number, lon: number) {
  const activeRule = ACTIVITY_LIBRARY[activityKey];
  if (!activeRule) throw new Error("Invalid activity rule");

  const targetDate = new Date(dateStr);
  const timeSlots: any[] = [];
  const flags = swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED | swisseph.SEFLG_MOSEPH;

  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const scanDate = new Date(targetDate);
      scanDate.setUTCHours(hour, min, 0, 0);

      const y = scanDate.getUTCFullYear();
      const m = scanDate.getUTCMonth() + 1;
      const d = scanDate.getUTCDate();
      const decimalHour = hour + (min / 60);

      const julday = await getJulDay(y, m, d, decimalHour);
      const ayanamsa = await getAyanamsa(julday);

      const moonResult = await getCalc(julday, swisseph.SE_MOON, flags);
      const sunResult = await getCalc(julday, swisseph.SE_SUN, flags);
      const moonLong = moonResult.longitude || moonResult[0] || 0;
      const sunLong = sunResult.longitude || sunResult[0] || 0;

      const moonSign = Math.floor(moonLong / 30);
      const nakshatraIndex = Math.floor(moonLong / (360 / 27));
      const luniSolarDiff = (moonLong - sunLong + 360) % 360;
      const tithiIndex = Math.floor(luniSolarDiff / 12);
      const dayIndex = scanDate.getUTCDay();

      const housesResult = await getHouses(julday, lat, lon);
      const ascTropical = housesResult.ascendant || housesResult.house?.[1] || housesResult[1] || 0;
      const lagna = (ascTropical - ayanamsa + 360) % 360;
      const lagnaSign = Math.floor(lagna / 30);

      const isFavorableLagna = activeRule.favorable_lagnas ? activeRule.favorable_lagnas.includes(lagnaSign) : false;

      let comboMatch = null;
      if (activeRule.micro_combinations) {
        for (const combo of activeRule.micro_combinations) {
          if (combo.check(lagnaSign, moonSign, nakshatraIndex, dayIndex, tithiIndex)) {
            comboMatch = combo.name;
            break;
          }
        }
      }

      timeSlots.push({
        time_utc: scanDate.toISOString(),
        time_local: scanDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
        lagna_sign: lagnaSign,
        lagna_name: RASI_NAMES[lagnaSign],
        favorable_lagna: isFavorableLagna,
        combination_active: comboMatch
      });
    }
  }

  const windows: any[] = [];
  let currentWindow: any = null;

  for (const slot of timeSlots) {
    if (!currentWindow || currentWindow.lagna_sign !== slot.lagna_sign || currentWindow.combination_active !== slot.combination_active) {
      if (currentWindow) windows.push(currentWindow);
      currentWindow = {
        start_time: slot.time_local,
        end_time: slot.time_local,
        lagna_sign: slot.lagna_sign,
        lagna_name: slot.lagna_name,
        favorable_lagna: slot.favorable_lagna,
        combination_active: slot.combination_active
      };
    } else {
      currentWindow.end_time = slot.time_local;
    }
  }
  if (currentWindow) windows.push(currentWindow);

  return { date_scanned: targetDate.toISOString(), windows };
}
