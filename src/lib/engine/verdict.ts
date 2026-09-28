export const taraData = [
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

export const getKaranaName = (kIndex: number) => {
  if (kIndex === 0) return "1st - Kintughna";
  if (kIndex === 57) return "58th - Shakuni";
  if (kIndex === 58) return "59th - Chatushpada";
  if (kIndex === 59) return "60th - Naga";
  const movable = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti (Bhadra)"];
  return `${kIndex + 1}th - ${movable[(kIndex - 1) % 7]}`;
};

export function evaluateMuhurta(tithiIndex: number, dayIndex: number, karanaIndex: number, marsHouse: number, venHouse: number, nakshatraIndex: number, natalNakshatraIndex: number) {
  const taraDistance = (nakshatraIndex - natalNakshatraIndex + 27) % 27;
  const taraIndex = taraDistance % 9;
  const currentTara = taraData[taraIndex];
  const isTaraFavorable = [1, 3, 5, 7, 8].includes(taraIndex);

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

  let verdict = "[ NEUTRAL ] Standard Muhurta conditions.";
  let verdictColor = "text-yellow-400";
  let status = "NEUTRAL";

  if (hasFatalFlaw) {
    verdict = "[ FATAL ] Mahadosha active: " + (isKujaAshtaka ? "Kuja Ashtaka (Mars in 8th). " : "") + (isBhriguShataka ? "Bhrigu Shataka (Venus in 6th)." : "") + " DO NOT PROCEED.";
    verdictColor = "text-red-600 bg-red-900/20 font-bold p-1";
    status = "FATAL";
  } else if (isBadCompoundYoga) {
    verdict = "[ DESTROYED ] Inauspicious Vara/Tithi Yoga active (Dagdha/Visha/Hutasana/Krakacha). Avoid.";
    verdictColor = "text-red-500 font-bold";
    status = "DESTROYED";
  } else if (isAmrita || isSiddha) {
    verdict = "[ EXCELLENT ] Auspicious Vara/Tithi Yoga active (Amrita/Siddha). Success is highly supported.";
    verdictColor = "text-green-400 font-bold";
    status = "EXCELLENT";
  } else {
    const isVishtiKarana = getKaranaName(karanaIndex).includes("Vishti");
    const isExceptionTriggered = isSiddha || isAmrita;
    if (isRikta && !isExceptionTriggered) {
      verdict = "[ CAUTION ] Rikta Tithi - Generally inauspicious.";
      verdictColor = "text-orange-400";
      status = "CAUTION";
    } else if (isVishtiKarana && !isExceptionTriggered) {
      verdict = "[ AVOID ] Vishti Karana - Inauspicious for new beginnings.";
      verdictColor = "text-red-500";
      status = "AVOID";
    }
  }

  return {
    status,
    text: verdict,
    color: verdictColor,
    taraName: currentTara,
    isTaraFavorable,
    compoundYogaName: compoundYoga
  };
}
