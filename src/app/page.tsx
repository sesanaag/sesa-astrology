import swisseph from 'swisseph';
import { taraData, getKaranaName, evaluateMuhurta } from '@/lib/engine/verdict';

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

const getHouses = (julday: number, lat: number, lon: number, houseSystem: string) => {
  return new Promise((resolve, reject) => {
    swisseph.swe_houses(julday, lat, lon, houseSystem, (result: any) => {
      if (result.error) reject(result.error);
      else resolve(result);
    });
  });
};

export default async function JyotishMVP() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  const hour = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;

  const lat = 28.6139;
  const lon = 77.2090;

  swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

  const julday = await getJulDay(year, month, day, hour);
  const ayanamsa = await getAyanamsa(julday);

  const moonFlags = swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED | swisseph.SEFLG_MOSEPH;
  const moonResult = await getCalc(julday, swisseph.SE_MOON, moonFlags);
  const moonLong = moonResult.longitude || moonResult[0] || 0;

  const sunResult = await getCalc(julday, swisseph.SE_SUN, moonFlags);
  const sunLong = sunResult.longitude || sunResult[0] || 0;

  const jupResult = await getCalc(julday, swisseph.SE_JUPITER, moonFlags);
  const jupLong = jupResult.longitude || jupResult[0] || 0;

  const venResult = await getCalc(julday, swisseph.SE_VENUS, moonFlags);
  const venLong = venResult.longitude || venResult[0] || 0;

  const marsResult = await getCalc(julday, swisseph.SE_MARS, moonFlags);
  const marsLong = marsResult.longitude || marsResult[0] || 0;

  const housesResult = await getHouses(julday, lat, lon, 'P');
  const ascTropical = housesResult.ascendant || housesResult.house?.[1] || housesResult[1] || 0;
  let lagna = (ascTropical - ayanamsa + 360) % 360;

  let luniSolarDiff = (moonLong - sunLong) % 360;
  if (luniSolarDiff < 0) luniSolarDiff += 360;

  const tithiIndex = Math.floor(luniSolarDiff / 12);
  const karanaIndex = Math.floor(luniSolarDiff / 6);
  const yogaLong = (sunLong + moonLong) % 360;
  const yogaIndex = Math.floor(yogaLong / (360 / 27));

  const lagnaSign = Math.floor(lagna / 30);
  const jupSign = Math.floor(jupLong / 30);
  const venSign = Math.floor(venLong / 30);
  const jupHouse = (jupSign - lagnaSign + 12) % 12 + 1;
  const venHouse = (venSign - lagnaSign + 12) % 12 + 1;

  const marsSign = Math.floor(marsLong / 30);
  const marsHouse = (marsSign - lagnaSign + 12) % 12 + 1;

  const nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
    "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
    "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
    "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
    "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];

  const tithiNames = [
    "1st - Pratipada", "2nd - Dwitiya", "3rd - Tritiya", "4th - Chaturthi", "5th - Panchami",
    "6th - Shashthi", "7th - Saptami", "8th - Ashtami", "9th - Navami", "10th - Dashami",
    "11th - Ekadashi", "12th - Dwadashi", "13th - Trayodashi", "14th - Chaturdashi", "15th - Purnima",
    "16th - Pratipada", "17th - Dwitiya", "18th - Tritiya", "19th - Chaturthi", "20th - Panchami",
    "21th - Shashthi", "22th - Saptami", "23th - Ashtami", "24th - Navami", "25th - Dashami",
    "26th - Ekadashi", "27th - Dwadashi", "28th - Trayodashi", "29th - Chaturdashi", "30th - Amavasya"
  ];
  
  const yogaNames = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", 
    "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", 
    "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", 
    "Shukla", "Brahma", "Indra", "Vaidhriti"
  ];

  const nakshatraIndex = Math.floor(moonLong / (360 / 27));
  const currentNakshatra = nakshatras[nakshatraIndex % 27];

  // Vara (Vedic Weekday) - simplified sunrise boundary at 6 AM IST
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  let dayIndex = istTime.getUTCDay();
  if (istTime.getUTCHours() < 6) {
    dayIndex = (dayIndex - 1 + 7) % 7;
  }
  const varaNames = [
    "Sun's Vara (Sunday)", "Moon's Vara (Monday)", "Mars's Vara (Tuesday)",
    "Mercury's Vara (Wednesday)", "Jupiter's Vara (Thursday)",
    "Venus's Vara (Friday)", "Saturn's Vara (Saturday)"
  ];
  const currentVara = varaNames[dayIndex];

  const verdict = evaluateMuhurta(tithiIndex, dayIndex, karanaIndex, marsHouse, venHouse, nakshatraIndex, 8);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <div className="max-w-2xl mx-auto border border-green-500/30 rounded bg-black/80 p-8 shadow-2xl">
        <div className="mb-8 border-b border-green-500/30 pb-4">
          <div className="text-green-300 text-xl font-bold tracking-widest">JYOTISH TERMINAL v0.6</div>
          <div className="text-green-500/60 text-sm">sidereal • lahiri ayanamsa • whole sign houses</div>
        </div>

        <div className="space-y-6 text-sm">
          <div className="flex justify-between">
            <span className="text-green-500">SYSTEM TIME (UTC)</span>
            <span>{now.toISOString().replace('T', ' ').slice(0, 19)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-green-500">LOCATION</span>
            <span>28.6139°N, 77.2090°E (New Delhi)</span>
          </div>

          <div className="flex justify-between">
            <span className="text-green-500">LAGNA (ASCENDANT)</span>
            <span>{lagna.toFixed(4)}°</span>
          </div>

          <div className="flex justify-between">
            <span className="text-green-500">MOON LONGITUDE</span>
            <span>{moonLong.toFixed(4)}°</span>
          </div>

          <div className="flex justify-between">
            <span className="text-green-500">SUN LONGITUDE</span>
            <span>{sunLong.toFixed(4)}°</span>
          </div>

          <div className="flex justify-between">
            <span className="text-green-500">CURRENT NAKSHATRA</span>
            <span className="text-yellow-400 font-bold">{currentNakshatra}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-green-500">CURRENT TITHI</span>
            <span>{tithiNames[tithiIndex]}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-green-500">CURRENT KARANA</span>
            <span>{getKaranaName(karanaIndex)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-green-500">CURRENT YOGA</span>
            <span>{yogaNames[yogaIndex]}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-green-500">CURRENT VARA</span>
            <span>{currentVara}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-green-500">PERSONAL TARA</span>
            <span className={verdict.color}>{verdict.taraName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-green-500">COMPOUND YOGA</span>
            <span className={verdict.color}>{verdict.compoundYogaName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-green-500">PLANETARY ANCHORS</span>
            <span>Jupiter in House {jupHouse} • Venus in House {venHouse} • Mars in House {marsHouse}</span>
          </div>

          <div className={`pt-6 border-t border-green-500/30 text-sm ${verdict.color}`}>
            {verdict.text}
          </div>
        </div>

        <div className="mt-12 text-[10px] text-green-500/40 border-t border-green-500/20 pt-4">
          COMPUTED SERVER-SIDE • JULIAN DAY: {julday.toFixed(6)} • AYANAMSA: {ayanamsa.toFixed(4)}°
        </div>
      </div>
    </div>
  );
}
