import swisseph from 'swisseph';

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

  const getKaranaName = (kIndex: number) => {
    if (kIndex === 0) return "1st - Kintughna";
    if (kIndex === 57) return "58th - Shakuni";
    if (kIndex === 58) return "59th - Chatushpada";
    if (kIndex === 59) return "60th - Naga";
    const movable = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti (Bhadra)"];
    return `${kIndex + 1}th - ${movable[(kIndex - 1) % 7]}`;
  };

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

  // Tara (Personalized Nakshatra Alignment) - natal Moon in Ashlesha (index 8)
  const natalNakshatraIndex = 8;
  const taraDistance = (nakshatraIndex - natalNakshatraIndex + 27) % 27;
  const taraIndex = taraDistance % 9;
  const taraData = [
    "Janma (Birth) - Unfavorable",
    "Sampat (Wealth) - Favorable",
    "Vipat (Danger) - Unfavorable",
    "Kshema (Security) - Favorable",
    "Pratyak (Obstacles) - Unfavorable",
    "Sadhaka (Success) - Favorable",
    "Vadha (Destruction) - Unfavorable",
    "Maitra (Friendly) - Favorable",
    "Parama Maitra (Great Friend) - Favorable"
  ];
  const currentTara = taraData[taraIndex];
  const isTaraFavorable = [1, 3, 5, 7, 8].includes(taraIndex);
  const taraColor = isTaraFavorable ? "text-green-400" : "text-red-500";

  // Compound Vara/Tithi Yogas v0.5
  const pakshaTithi = (tithiIndex % 15) + 1;
  const isNanda = [1, 6, 11].includes(pakshaTithi);
  const isBhadra = [2, 7, 12].includes(pakshaTithi);
  const isJaya = [3, 8, 13].includes(pakshaTithi);
  const isRikta = [4, 9, 14].includes(pakshaTithi);
  const isPurna = [5, 10, 15].includes(pakshaTithi);

  const isSiddha = (dayIndex === 5 && isNanda) || (dayIndex === 3 && isBhadra) || (dayIndex === 2 && isJaya) || (dayIndex === 6 && isRikta) || (dayIndex === 4 && isPurna);
  const isAmrita = (dayIndex === 0 && isNanda) || (dayIndex === 1 && isBhadra) || (dayIndex === 2 && isNanda) || (dayIndex === 3 && isJaya) || (dayIndex === 4 && isRikta) || (dayIndex === 5 && isBhadra) || (dayIndex === 6 && isPurna);

  const dagdhaMap = [12, 11, 5, 3, 6, 8, 9];
  const vishaMap = [4, 6, 7, 2, 8, 9, 7];
  const hutasanaMap = [12, 6, 7, 8, 9, 10, 11];
  const krakachaMap = [12, 11, 10, 9, 8, 7, 6];

  const isDagdha = pakshaTithi === dagdhaMap[dayIndex];
  const isVisha = pakshaTithi === vishaMap[dayIndex];
  const isHutasana = pakshaTithi === hutasanaMap[dayIndex];
  const isKrakacha = pakshaTithi === krakachaMap[dayIndex];
  const isBadCompoundYoga = isDagdha || isVisha || isHutasana || isKrakacha;

  let compoundYoga = "None Active";
  if (isAmrita) compoundYoga = "Amrita";
  else if (isSiddha) compoundYoga = "Siddha";
  else if (isDagdha) compoundYoga = "Dagdha";
  else if (isVisha) compoundYoga = "Visha";
  else if (isHutasana) compoundYoga = "Hutasana";
  else if (isKrakacha) compoundYoga = "Krakacha";

  const isKujaAshtaka = marsHouse === 8;
  const isBhriguShataka = venHouse === 6;
  const hasFatalFlaw = isKujaAshtaka || isBhriguShataka;

  // Verdict Engine v0.6 - Mahadosha (Fatal Flaw) Filter at top
  let verdict = "[ NEUTRAL ] Standard Muhurta conditions.";
  let verdictColor = "text-yellow-400";
  if (hasFatalFlaw) {
    verdict = "[ FATAL ] Mahadosha active: " + (isKujaAshtaka ? "Kuja Ashtaka (Mars in 8th). " : "") + (isBhriguShataka ? "Bhrigu Shataka (Venus in 6th)." : "") + " DO NOT PROCEED.";
    verdictColor = "text-red-600 bg-red-900/20 font-bold p-1";
  } else if (isBadCompoundYoga) {
    verdict = "[ DESTROYED ] Inauspicious Vara/Tithi Yoga active (Dagdha/Visha/Hutasana/Krakacha). Avoid.";
    verdictColor = "text-red-500 font-bold";
  } else if (isAmrita || isSiddha) {
    verdict = "[ EXCELLENT ] Auspicious Vara/Tithi Yoga active (Amrita/Siddha). Success is highly supported.";
    verdictColor = "text-green-400 font-bold";
  } else {
    // V0.3 fallback
    const isRiktaTithi = isRikta;
    const isVishtiKarana = getKaranaName(karanaIndex).includes("Vishti");
    const isExceptionTriggered = isSiddha || isAmrita;
    if (isRiktaTithi && !isExceptionTriggered) {
      verdict = "[ CAUTION ] Rikta Tithi - Generally inauspicious.";
      verdictColor = "text-orange-400";
    } else if (isVishtiKarana && !isExceptionTriggered) {
      verdict = "[ AVOID ] Vishti Karana - Inauspicious for new beginnings.";
      verdictColor = "text-red-500";
    }
  }

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
            <span className={taraColor}>{currentTara}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-green-500">COMPOUND YOGA</span>
            <span className={isBadCompoundYoga ? "text-red-500" : ((isAmrita || isSiddha) ? "text-green-400" : "text-yellow-400")}>{compoundYoga}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-green-500">PLANETARY ANCHORS</span>
            <span>Jupiter in House {jupHouse} • Venus in House {venHouse} • Mars in House {marsHouse}</span>
          </div>

          <div className={`pt-6 border-t border-green-500/30 text-sm ${verdictColor}`}>
            {verdict}
          </div>
        </div>

        <div className="mt-12 text-[10px] text-green-500/40 border-t border-green-500/20 pt-4">
          COMPUTED SERVER-SIDE • JULIAN DAY: {julday.toFixed(6)} • AYANAMSA: {ayanamsa.toFixed(4)}°
        </div>
      </div>
    </div>
  );
}
