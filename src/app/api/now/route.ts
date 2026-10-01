import { NextRequest, NextResponse } from 'next/server';
import swisseph from 'swisseph';
import path from 'path';

const NAKSHATRAS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
const YOGAS = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
const KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kintughna"];
const RASI_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

const getJulDay = (year: number, month: number, day: number, hour: number): Promise<number> => new Promise(r => swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL, (res: any) => r(res.julday || res)));
const getAyanamsa = (julday: number): Promise<number> => new Promise(r => swisseph.swe_get_ayanamsa_ut(julday, (res: any) => r(res.ayanamsa || res)));
const getCalc = (julday: number, planet: number, flags: number): Promise<any> => new Promise((r, rej) => swisseph.swe_calc_ut(julday, planet, flags, (res: any) => res.error ? rej(res.error) : r(res)));
const getHouses = (julday: number, lat: number, lon: number): Promise<any> => new Promise((r, rej) => swisseph.swe_houses_ex(julday, swisseph.SEFLG_SIDEREAL, lat, lon, 'W', (res: any) => res.error ? rej(res.error) : r(res)));

const formatDeg = (deg: number) => {
  const signIndex = Math.floor(deg / 30);
  const signDeg = deg % 30;
  const d = Math.floor(signDeg);
  const m = Math.floor((signDeg - d) * 60);
  return `${d}° ${m}' in ${RASI_NAMES[signIndex]}`;
};

export async function GET(request: NextRequest) {
  try {
    swisseph.swe_set_ephe_path(path.join(process.cwd(), 'node_modules', 'swisseph', 'ephe'));
    swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

    const lat = parseFloat(request.nextUrl.searchParams.get('lat') || '51.6242');
    const lon = parseFloat(request.nextUrl.searchParams.get('lon') || '0.0604');

    const now = new Date();
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth() + 1;
    const d = now.getUTCDate();
    const hour = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;

    const julday = await getJulDay(y, m, d, hour);
    const ayanamsa = await getAyanamsa(julday);
    const flags = swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED | swisseph.SEFLG_MOSEPH;

    const moonRes: any = await getCalc(julday, swisseph.SE_MOON, flags);
    const sunRes: any = await getCalc(julday, swisseph.SE_SUN, flags);
    const housesRes: any = await getHouses(julday, lat, lon);

    const moonLong = moonRes.longitude || moonRes[0] || 0;
    const sunLong = sunRes.longitude || sunRes[0] || 0;
    
    const ascTropical = housesRes.ascendant || housesRes.house?.[1] || housesRes[1] || 0;
    const ascSidereal = (ascTropical - ayanamsa + 360) % 360;

    // Panchanga Calculations
    const diff = (moonLong - sunLong + 360) % 360;
    const tithiNum = Math.floor(diff / 12) + 1;
    const tithiType = tithiNum <= 15 ? `Shukla ${tithiNum}` : `Krishna ${tithiNum - 15}`;
    
    const karanaNum = Math.floor(diff / 6) + 1;
    const karanaIndex = karanaNum === 1 ? 10 : karanaNum > 57 ? karanaNum - 50 : (karanaNum - 2) % 7;
    const karanaName = KARANAS[karanaIndex] || "Unknown";

    const yogaSum = (moonLong + sunLong) % 360;
    const yogaIndex = Math.floor(yogaSum / (360 / 27));
    const yogaName = YOGAS[yogaIndex] || "Unknown";

    const nakIndex = Math.floor(moonLong / (360 / 27));
    const nakName = NAKSHATRAS[nakIndex] || "Unknown";
    const nakProgress = ((moonLong % (360 / 27)) / (360 / 27)) * 100;

    // Assessment Engine
    let assessment = "[ NEUTRAL ] Standard Muhurta conditions prevailing.";
    let status = "neutral";
    const riktaTithis = [4, 9, 14, 19, 24, 29];

    if (riktaTithis.includes(tithiNum)) {
      assessment = `[ WARNING ] Rikta (Empty) Tithi active. Avoid initiating auspicious events.`;
      status = "warning";
    } else if (karanaIndex === 6) {
      assessment = `[ DANGER ] Vishti Karana (Bhadra) is active. Highly malefic for most activities.`;
      status = "danger";
    } else if (yogaIndex === 16 || yogaIndex === 26) {
      assessment = `[ WARNING ] Malefic Yoga (${yogaName}) active. Delays and obstacles likely.`;
      status = "warning";
    } else if (now.getUTCDay() === 4 && tithiNum === 5) {
      assessment = `[ EXCELLENT ] Siddhi Yoga active. Highly favorable for expansion.`;
      status = "excellent";
    }

    return NextResponse.json({
      timestamp: now.toUTCString(),
      lat, lon, ayanamsa,
      ascendant: formatDeg(ascSidereal),
      moon: formatDeg(moonLong),
      sun: formatDeg(sunLong),
      nakshatra: { name: nakName, index: nakIndex, progress: nakProgress.toFixed(1) },
      tithi: { name: tithiType, number: tithiNum },
      karana: { name: karanaName },
      yoga: { name: yogaName },
      assessment: { text: assessment, status }
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Failed to read live ephemeris" }, { status: 500 });
  }
}
