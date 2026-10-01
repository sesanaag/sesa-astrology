import swisseph from 'swisseph';
import path from 'path';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const RASI_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const getJulDay = (year: number, month: number, day: number, hour: number): Promise<number> => {
  return new Promise((resolve) =>
    swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL, (r: any) => resolve(r.julday || r))
  );
};

const getAyanamsa = (julday: number): Promise<number> => {
  return new Promise((resolve) =>
    swisseph.swe_get_ayanamsa_ut(julday, (r: any) => resolve(r.ayanamsa || r))
  );
};

const getCalc = (julday: number, planet: number, flags: number): Promise<any> => {
  return new Promise((resolve, reject) =>
    swisseph.swe_calc_ut(julday, planet, flags, (r: any) => (r.error ? reject(r.error) : resolve(r)))
  );
};

const getHouses = (julday: number, lat: number, lon: number): Promise<any> => {
  return new Promise((resolve, reject) =>
    swisseph.swe_houses_ex(julday, swisseph.SEFLG_SIDEREAL, lat, lon, 'W', (r: any) =>
      r.error ? reject(r.error) : resolve(r)
    )
  );
};

const formatDeg = (deg: number) => {
  const signIndex = Math.floor(deg / 30);
  const signDeg = deg % 30;
  const d = Math.floor(signDeg);
  const m = Math.floor((signDeg - d) * 60);
  return `${d}° ${m}' in ${RASI_NAMES[signIndex]}`;
};

export default async function Home() {
  swisseph.swe_set_ephe_path(path.join(process.cwd(), 'node_modules', 'swisseph', 'ephe'));
  swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  const d = now.getUTCDate();
  const hour = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;

  const lat = 51.6242;
  const lon = 0.0604;

  const julday = await getJulDay(y, m, d, hour);
  const ayanamsa = await getAyanamsa(julday);
  const flags = swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED | swisseph.SEFLG_MOSEPH;

  const moonRes: any = await getCalc(julday, swisseph.SE_MOON, flags);
  const sunRes: any = await getCalc(julday, swisseph.SE_SUN, flags);
  const jupRes: any = await getCalc(julday, swisseph.SE_JUPITER, flags);
  const venRes: any = await getCalc(julday, swisseph.SE_VENUS, flags);
  const marsRes: any = await getCalc(julday, swisseph.SE_MARS, flags);
  const satRes: any = await getCalc(julday, swisseph.SE_SATURN, flags);
  const housesRes: any = await getHouses(julday, lat, lon);

  const moonLong = moonRes.longitude || moonRes[0] || 0;
  const sunLong = sunRes.longitude || sunRes[0] || 0;
  const jupLong = jupRes.longitude || jupRes[0] || 0;
  const venLong = venRes.longitude || venRes[0] || 0;
  const marsLong = marsRes.longitude || marsRes[0] || 0;
  const satLong = satRes.longitude || satRes[0] || 0;

  const ascTropical = housesRes.ascendant || housesRes.house?.[1] || housesRes[1] || 0;
  const ascSidereal = (ascTropical - ayanamsa + 360) % 360;

  const nakIndex = Math.floor(moonLong / (360 / 27));
  const nakName = NAKSHATRAS[nakIndex] || "Unknown";
  const nakProgress = ((moonLong % (360 / 27)) / (360 / 27)) * 100;

  const diff = (moonLong - sunLong + 360) % 360;
  const tithiNum = Math.floor(diff / 12) + 1;
  const tithiType = tithiNum <= 15 ? `Shukla ${tithiNum}` : `Krishna ${tithiNum - 15}`;

  const bodies = [
    { name: "Ascendant (Lagna)", pos: formatDeg(ascSidereal), speed: "—" },
    { name: "Moon (Chandra)", pos: formatDeg(moonLong), speed: `${(moonRes.speed || 0).toFixed(2)}°/day` },
    { name: "Sun (Surya)", pos: formatDeg(sunLong), speed: `${(sunRes.speed || 0).toFixed(2)}°/day` },
    { name: "Jupiter (Guru)", pos: formatDeg(jupLong), speed: `${(jupRes.speed || 0).toFixed(2)}°/day` },
    { name: "Venus (Shukra)", pos: formatDeg(venLong), speed: `${(venRes.speed || 0).toFixed(2)}°/day` },
    { name: "Mars (Mangala)", pos: formatDeg(marsLong), speed: `${(marsRes.speed || 0).toFixed(2)}°/day` },
    { name: "Saturn (Shani)", pos: formatDeg(satLong), speed: `${(satRes.speed || 0).toFixed(2)}°/day` },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A2E26] font-sans font-light relative selection:bg-[#00FBB0] selection:text-[#021F1E]">
      
      {/* DARK TEAL HEADER */}
      <div className="bg-[#021F1E] border-b-2 border-[#D4AF37]/30 shadow-lg relative z-10 w-full">
        <header className="max-w-5xl mx-auto px-8 py-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-2xl font-light tracking-[0.25em] text-[#00FBB0] mb-3 uppercase flex items-center gap-3 drop-shadow-md">
              Sesa Astrology <span className="text-[#D4AF37] text-sm">✦</span>
            </h1>
            <p className="text-xs text-[#89CFF0] font-normal tracking-widest uppercase">
              Real-Time Ephemeris Snapshot • {now.toUTCString()}
            </p>
          </div>
          
          <Link
            href="/planner"
            className="bg-[#0A4A49] text-[#00FBB0] hover:bg-[#00FBB0] hover:text-[#021F1E] px-8 py-3 rounded-none transition-colors flex items-center gap-2 font-bold tracking-[0.2em] whitespace-nowrap uppercase text-xs shadow-sm"
          >
            Launch Muhurta Planner →
          </Link>
        </header>
      </div>

      {/* CREAM BODY */}
      <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">
        
        {/* PANCHANGA HIGHLIGHT TILES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-[#E0E7E7]/50">
            <span className="text-[10px] text-[#7A8B8C] font-medium tracking-[0.2em] uppercase block mb-3">Moon Nakshatra</span>
            <div className="text-xl font-normal text-[#1A2E26] tracking-wide mb-2">{nakName}</div>
            <div className="text-xs text-[#0D5C58] tracking-wider uppercase font-medium">Index {nakIndex} • {nakProgress.toFixed(1)}% Passed</div>
          </div>

          <div className="bg-white p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-[#E0E7E7]/50">
            <span className="text-[10px] text-[#7A8B8C] font-medium tracking-[0.2em] uppercase block mb-3">Current Tithi</span>
            <div className="text-xl font-normal text-[#1A2E26] tracking-wide mb-2">{tithiType}</div>
            <div className="text-xs text-[#7A8B8C] tracking-wider uppercase">Tithi {tithiNum} of 30</div>
          </div>

          <div className="bg-white p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-[#E0E7E7]/50">
            <span className="text-[10px] text-[#7A8B8C] font-medium tracking-[0.2em] uppercase block mb-3">Lahiri Ayanamsa</span>
            <div className="text-xl font-normal text-[#1A2E26] tracking-wide mb-2">{ayanamsa.toFixed(4)}°</div>
            <div className="text-xs text-[#89CFF0] tracking-wider uppercase font-medium">Sidereal Lahiri Mode</div>
          </div>
        </div>

        {/* PLANETARY LONGITUDES TABLE */}
        <div className="bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-[#E0E7E7]/50 p-8">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E0E7E7]">
            <h2 className="text-sm font-medium tracking-[0.2em] text-[#0D5C58] uppercase">
              Graha Sphutas (Planetary Positions)
            </h2>
            <span className="text-[10px] text-[#7A8B8C] tracking-widest uppercase">
              Observer: {lat}° N, {lon}° E
            </span>
          </div>

          <div className="divide-y divide-[#E0E7E7]/60">
            {bodies.map((body, idx) => (
              <div key={idx} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <span className="font-medium tracking-wider text-[#1A2E26] uppercase w-48">{body.name}</span>
                <span className="font-normal text-[#0D5C58] tracking-wide">{body.pos}</span>
                <span className="text-[11px] text-[#7A8B8C] tracking-widest uppercase sm:text-right w-28">{body.speed}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM ACTION BANNER */}
        <div className="bg-[#021F1E] p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6 shadow-md border-t-2 border-[#D4AF37]">
          <div>
            <h3 className="text-lg font-light tracking-[0.2em] text-[#00FBB0] uppercase mb-1">
              Need to Plan an Auspicious Window?
            </h3>
            <p className="text-xs text-[#89CFF0] tracking-wider font-light">
              Filter by activity, analyze rising Lagnas, and discover rare Muhurta Yogas.
            </p>
          </div>
          <Link
            href="/planner"
            className="bg-[#00FBB0] text-[#021F1E] hover:bg-white px-8 py-3 rounded-none font-bold tracking-[0.2em] uppercase text-xs transition-colors whitespace-nowrap"
          >
            Open Planner
          </Link>
        </div>

      </div>
    </div>
  );
}
