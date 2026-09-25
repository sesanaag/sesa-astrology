import swisseph from 'swisseph';

const getJulDay = (year: number, month: number, day: number, hour: number) => {
  return new Promise((resolve, reject) => {
    swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL, (result: any) => {
      if (result.error) reject(result.error);
      else resolve(result.julday);
    });
  });
};

const getAyanamsa = (julday: number) => {
  return new Promise((resolve, reject) => {
    swisseph.swe_get_ayanamsa_ut(julday, (result: any) => {
      if (result.error) reject(result.error);
      else resolve(result.ayanamsa);
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
    swisseph.swe_houses(julday, lat, lon, houseSystem.charCodeAt(0), (result: any) => {
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

  const housesResult = await getHouses(julday, lat, lon, 'P');
  const ascTropical = housesResult.ascendant || housesResult.house?.[1] || housesResult[1] || 0;
  let lagna = (ascTropical - ayanamsa + 360) % 360;

  const nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
    "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
    "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
    "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
    "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];
  const nakshatraIndex = Math.floor(moonLong / (360 / 27));
  const currentNakshatra = nakshatras[nakshatraIndex % 27];

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <div className="max-w-2xl mx-auto border border-green-500/30 rounded bg-black/80 p-8 shadow-2xl">
        <div className="mb-8 border-b border-green-500/30 pb-4">
          <div className="text-green-300 text-xl font-bold tracking-widest">JYOTISH TERMINAL v0.1</div>
          <div className="text-green-500/60 text-sm">sidereal • lahiri ayanamsa • placidus houses</div>
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
            <span className="text-green-500">CURRENT NAKSHATRA</span>
            <span className="text-yellow-400 font-bold">{currentNakshatra}</span>
          </div>
        </div>

        <div className="mt-12 text-[10px] text-green-500/40 border-t border-green-500/20 pt-4">
          COMPUTED SERVER-SIDE • JULIAN DAY: {julday.toFixed(6)} • AYANAMSA: {ayanamsa.toFixed(4)}°
        </div>
      </div>
    </div>
  );
}
