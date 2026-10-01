"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNow = async () => {
      const lat = localStorage.getItem('jyotish_lat') || "51.6242";
      const lon = localStorage.getItem('jyotish_lon') || "0.0604";
      
      try {
        const res = await fetch(`/api/now?lat=${lat}&lon=${lon}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchNow();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A2E26] font-sans font-light relative selection:bg-[#00FBB0] selection:text-[#021F1E]">
      <div className="bg-[#021F1E] border-b-2 border-[#D4AF37]/30 shadow-lg relative z-10 w-full">
        <header className="max-w-5xl mx-auto px-8 py-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-2xl font-light tracking-[0.25em] text-[#00FBB0] mb-3 uppercase flex items-center gap-3 drop-shadow-md">
              Sesa Astrology <span className="text-[#D4AF37] text-sm">✦</span>
            </h1>
            <p className="text-xs text-[#89CFF0] font-normal tracking-widest uppercase">
              Live Ephemeris Snapshot • {data ? data.timestamp : "Loading..."}
            </p>
          </div>
          <Link href="/planner" className="bg-[#0A4A49] text-[#00FBB0] hover:bg-[#00FBB0] hover:text-[#021F1E] px-8 py-3 rounded-none transition-colors flex items-center gap-2 font-bold tracking-[0.2em] whitespace-nowrap uppercase text-xs shadow-sm">
            Launch Muhūrta Planner →
          </Link>
        </header>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">
        {loading ? (
           <div className="text-center py-20 text-[#0D5C58] font-medium tracking-[0.2em] uppercase text-sm animate-pulse">
             Synchronizing local GPS with ephemeris...
           </div>
        ) : !data ? (
           <div className="text-center py-20 text-[#7A8B8C] font-medium tracking-[0.2em] uppercase text-sm">
             Failed to load ephemeris.
           </div>
        ) : (
          <>
            <div className={`p-6 border-l-4 shadow-sm ${
              data.assessment.status === 'danger' ? 'bg-red-50 border-red-500 text-red-900' :
              data.assessment.status === 'warning' ? 'bg-amber-50 border-[#D4AF37] text-amber-900' :
              data.assessment.status === 'excellent' ? 'bg-[#E0F6F5] border-[#00FBB0] text-[#0D5C58]' :
              'bg-white border-[#7A8B8C] text-[#1A2E26]'
            }`}>
              <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2 opacity-70">Live Environmental Assessment</h2>
              <p className="text-sm font-medium tracking-wide">{data.assessment.text}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-[#E0E7E7]/50">
                <span className="text-[10px] text-[#7A8B8C] font-medium tracking-[0.2em] uppercase block mb-3">Moon Nakṣatra</span>
                <div className="text-lg font-medium text-[#1A2E26] tracking-wide mb-1">{data.nakshatra.name}</div>
                <div className="text-[10px] text-[#0D5C58] tracking-widest uppercase">{data.nakshatra.progress}% Passed</div>
              </div>

              <div className="bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-[#E0E7E7]/50">
                <span className="text-[10px] text-[#7A8B8C] font-medium tracking-[0.2em] uppercase block mb-3">Current Tithi</span>
                <div className="text-lg font-medium text-[#1A2E26] tracking-wide mb-1">{data.tithi.name}</div>
                <div className="text-[10px] text-[#7A8B8C] tracking-widest uppercase">{data.tithi.phase} Phase</div>
              </div>

              <div className="bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-[#E0E7E7]/50">
                <span className="text-[10px] text-[#7A8B8C] font-medium tracking-[0.2em] uppercase block mb-3">Current Karaṇa</span>
                <div className="text-lg font-medium text-[#1A2E26] tracking-wide mb-1">{data.karana.name}</div>
                <div className="text-[10px] text-[#7A8B8C] tracking-widest uppercase">Half-Tithi</div>
              </div>

              <div className="bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-[#E0E7E7]/50">
                <span className="text-[10px] text-[#7A8B8C] font-medium tracking-[0.2em] uppercase block mb-3">Current Yoga</span>
                <div className="text-lg font-medium text-[#1A2E26] tracking-wide mb-1">{data.yoga.name}</div>
                <div className="text-[10px] text-[#7A8B8C] tracking-widest uppercase">Soli-Lunar Angle</div>
              </div>
            </div>

            <div className="bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-[#E0E7E7]/50 p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E0E7E7]">
                <h2 className="text-sm font-medium tracking-[0.2em] text-[#0D5C58] uppercase">
                  Graha Sphuṭas (Positions)
                </h2>
                <span className="text-[10px] text-[#7A8B8C] tracking-widest uppercase text-right">
                  Observer: {data.lat}° N, {data.lon}° E
                </span>
              </div>
              <div className="divide-y divide-[#E0E7E7]/60">
                <div className="py-4 flex justify-between items-center gap-2 text-xs">
                  <span className="font-medium tracking-wider text-[#1A2E26] uppercase w-40">Ascendant (Lagna)</span>
                  <span className="font-normal text-[#0D5C58] tracking-wide text-right">{data.ascendant}</span>
                </div>
                <div className="py-4 flex justify-between items-center gap-2 text-xs">
                  <span className="font-medium tracking-wider text-[#1A2E26] uppercase w-40">Moon (Candra)</span>
                  <span className="font-normal text-[#0D5C58] tracking-wide text-right">{data.moon}</span>
                </div>
                <div className="py-4 flex justify-between items-center gap-2 text-xs">
                  <span className="font-medium tracking-wider text-[#1A2E26] uppercase w-40">Sun (Sūrya)</span>
                  <span className="font-normal text-[#0D5C58] tracking-wide text-right">{data.sun}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
