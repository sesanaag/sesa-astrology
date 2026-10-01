import { NextRequest, NextResponse } from 'next/server';
import swisseph from 'swisseph';
import path from 'path';

const IAST_NAKSHATRAS = ["Aśvinī", "Bharaṇī", "Kṛttikā", "Rohiṇī", "Mṛgaśīrṣa", "Ārdrā", "Punarvasu", "Puṣya", "Āśleṣā", "Maghā", "Pūrva Phalgunī", "Uttara Phalgunī", "Hasta", "Citrā", "Svātī", "Viśākhā", "Anurādhā", "Jyeṣṭhā", "Mūla", "Pūrvāṣāḍhā", "Uttarāṣāḍhā", "Śravaṇa", "Dhaniṣṭhā", "Śatabhiṣak", "Pūrva Bhādrapadā", "Uttara Bhādrapadā", "Revatī"];
const YOGAS = ["Viṣkambha", "Prīti", "Āyuṣmān", "Saubhāgya", "Śobhana", "Atigaṇḍa", "Sukarman", "Dhṛti", "Śūla", "Gaṇḍa", "Vṛddhi", "Dhruva", "Vyāghāta", "Harṣaṇa", "Vajra", "Siddhi", "Vyatīpāta", "Varīyas", "Parigha", "Śiva", "Siddha", "Sādhya", "Śubha", "Śukla", "Brahman", "Aindra", "Vaidhṛti"];
const KARANAS = ["Bava", "Bālava", "Kaulava", "Taitila", "Gara", "Vaṇija", "Viṣṭi", "Śakuni", "Catuṣpāda", "Nāga", "Kiṃstughna"];
const RASI_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const IAST_TITHIS = ["Pratipat", "Dvitīyā", "Tṛtīyā", "Caturthī", "Pañcamī", "Ṣaṣṭhī", "Saptamī", "Aṣṭamī", "Navamī", "Daśamī", "Ekādaśī", "Dvādaśī", "Trayodaśī", "Caturdaśī"];

const getJulDay = (year: number, month: number, day: number, hour: number): Promise<number> => new Promise(r => swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL, (res: any) => r(res.julday || res)));
const getAyanamsa = (julday: number): Promise<number> => new Promise(r => swisseph.swe_get_ayanamsa_ut(julday, (res: any) => r(res.ayanamsa || res)));
const getCalc = (julday: number, planet: number, flags: number): Promise<any> => new Promise((r, rej) => swisseph.swe_calc_ut(julday, planet, flags, (res: any) => res.error ? rej(res.error) : r(res)));

// FIX: Removed SEFLG_SIDEREAL flag from the Houses calculation. This forces the C-binary to return the true Tropical Ascendant so our manual Lahiri subtraction is perfect.
const getHouses = (julday: number, lat: number, lon: number): Promise<any> => new Promise((r, rej) => swisseph.swe_houses(julday, lat, lon, 'W', (res: any) => res.error ? rej(res.error) : r(res)));

const formatDeg = (deg: number) => {
  const signIndex = Math.floor(deg / 30);
  const signDeg = deg % 30;
  const d = Math.floor(signDeg);
  const m = Math.floor((signDeg - d) * 60);
  return `${d}° ${m}' in ${RASI_NAMES[signIndex]}`;
};

const getSuffix = (n: number) => {
  if (n >= 11 && n <= 13) return 'th';
  switch (n % 10) { case 1: return "st"; case 2: return "nd"; case 3: return "rd"; default: return "th"; }
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
    
    // With the binary flag removed, this subtraction is now flawless.
    const ascTropical = housesRes.ascendant || housesRes.house?.[1] || housesRes[1] || 0;
    const ascSidereal = (ascTropical - ayanamsa + 360) % 360;

    const diff = (moonLong - sunLong + 360) % 360;
    const tithiNum = Math.floor(diff / 12) + 1;
    const tithiPhaseNum = tithiNum <= 15 ? tithiNum : tithiNum - 15;
    const phase = tithiNum <= 15 ? 'Śukla' : 'Kṛṣṇa';
    
    let tithiName = "";
    if (tithiNum === 15) tithiName = "Pūrṇimā";
    else if (tithiNum === 30) tithiName = "Amāvasyā";
    else tithiName = IAST_TITHIS[tithiPhaseNum - 1];

    const tithiDisplay = (tithiNum === 15 || tithiNum === 30) 
        ? `${tithiName} (${tithiPhaseNum}${getSuffix(tithiPhaseNum)})` 
        : `${tithiName} ${phase} Pakṣa (${tithiPhaseNum}${getSuffix(tithiPhaseNum)})`;
    
    const karanaNum = Math.floor(diff / 6) + 1;
    const karanaIndex = karanaNum === 1 ? 10 : karanaNum > 57 ? karanaNum - 50 : (karanaNum - 2) % 7;
    const karanaName = KARANAS[karanaIndex] || "Unknown";

    const yogaSum = (moonLong + sunLong) % 360;
    const yogaIndex = Math.floor(yogaSum / (360 / 27));
    const yogaName = YOGAS[yogaIndex] || "Unknown";

    const nakIndex = Math.floor(moonLong / (360 / 27));
    const nakName = IAST_NAKSHATRAS[nakIndex] || "Unknown";
    const nakProgress = ((moonLong % (360 / 27)) / (360 / 27)) * 100;

    let assessment = "[ NEUTRAL ] Standard Muhūrta conditions prevailing.";
    let status = "neutral";
    const riktaTithis = [4, 9, 14, 19, 24, 29];

    if (riktaTithis.includes(tithiNum)) {
      assessment = `[ WARNING ] Riktā (Empty) Tithi active. Avoid initiating auspicious events.`;
      status = "warning";
    } else if (karanaIndex === 6) {
      assessment = `[ DANGER ] Viṣṭi Karaṇa (Bhadra) is active. Highly malefic for most activities.`;
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
      tithi: { name: tithiDisplay, phase: phase },
      karana: { name: karanaName },
      yoga: { name: yogaName },
      assessment: { text: assessment, status }
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Failed to read live ephemeris" }, { status: 500 });
  }
}
