"use client";

import { useState, useEffect } from 'react';
import { ACTIVITY_LIBRARY } from '@/lib/engine/activities';

const ACTIVITIES = [
  { id: 'business', label: 'Business / Commerce' },
  { id: 'travel', label: 'Travel / Yatra' },
  { id: 'property', label: 'Property Purchasing' },
  { id: 'litigation', label: 'Litigation (Plaintiff)' },
  { id: 'hair_cutting', label: 'Hair & Beard Cutting' },
  { id: 'nail_cutting', label: 'Nail Cutting' },
  { id: 'oil_bath', label: 'Oil Bath (Abhyanga)' },
  { id: 'education', label: 'Education / Vidya' },
  { id: 'paying_debts', label: 'Paying Debts' }
];

export default function Planner() {
  const [activity, setActivity] = useState('travel');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [windows, setWindows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCriteria, setShowCriteria] = useState(true);
  
  const [showSettings, setShowSettings] = useState(false);
  const [lat, setLat] = useState("51.6242");
  const [lon, setLon] = useState("0.0604");
  const [natalStar, setNatalStar] = useState("11");

  const [microData, setMicroData] = useState<{date: string, windows: any[]} | null>(null);
  const [microLoading, setMicroLoading] = useState(false);

  useEffect(() => {
    setLat(localStorage.getItem('jyotish_lat') || "51.6242");
    setLon(localStorage.getItem('jyotish_lon') || "0.0604");
    setNatalStar(localStorage.getItem('jyotish_star') || "11");
  }, []);

  const saveSettings = () => {
    localStorage.setItem('jyotish_lat', lat);
    localStorage.setItem('jyotish_lon', lon);
    localStorage.setItem('jyotish_star', natalStar);
    setShowSettings(false);
    fetchWindows(activity, startDate);
  };

  const fetchWindows = async (selectedActivity: string, start: string) => {
    setLoading(true);
    setMicroData(null);
    try {
      const res = await fetch(`/api/scanner?activity=${selectedActivity}&natal_nakshatra=${natalStar}&startDate=${start}`);
      const data = await res.json();
      setWindows(data.viable_windows || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const optimizeTime = async (date: string) => {
    setMicroLoading(true);
    try {
      const res = await fetch(`/api/micro?date=${date}&activity=${activity}&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      setMicroData({ date, windows: data.windows || [] });
    } catch (error) {
      console.error(error);
    }
    setMicroLoading(false);
  };

  useEffect(() => {
    if (lat && lon) fetchWindows(activity, startDate);
  }, [activity, lat, lon, startDate]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A2E26] font-sans font-light relative selection:bg-[#00FBB0] selection:text-[#021F1E]">
      
      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-[#021F1E]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-10 rounded-none bg-[#063736] max-w-md w-full shadow-2xl relative border border-[#00FBB0]/20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#89CFF0] via-[#D4AF37] to-[#00FBB0]"></div>
            <h2 className="text-lg font-medium mb-8 text-[#00FBB0] tracking-[0.2em] uppercase">Engine Configuration</h2>
            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-xs font-medium mb-2 text-[#89CFF0] uppercase tracking-widest">Latitude</label>
                <input type="text" value={lat} onChange={e => setLat(e.target.value)} className="w-full bg-[#021F1E] border-none rounded-none px-4 py-3 text-[#FAF9F6] focus:outline-none focus:ring-1 focus:ring-[#00FBB0] transition-shadow" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 text-[#89CFF0] uppercase tracking-widest">Longitude</label>
                <input type="text" value={lon} onChange={e => setLon(e.target.value)} className="w-full bg-[#021F1E] border-none rounded-none px-4 py-3 text-[#FAF9F6] focus:outline-none focus:ring-1 focus:ring-[#00FBB0] transition-shadow" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 text-[#89CFF0] uppercase tracking-widest">Natal Nakshatra Index (0-26)</label>
                <input type="text" value={natalStar} onChange={e => setNatalStar(e.target.value)} className="w-full bg-[#021F1E] border-none rounded-none px-4 py-3 text-[#FAF9F6] focus:outline-none focus:ring-1 focus:ring-[#00FBB0] transition-shadow" />
              </div>
            </div>
            <button onClick={saveSettings} className="w-full bg-[#00FBB0] text-[#021F1E] py-4 rounded-none font-bold tracking-[0.2em] hover:bg-white transition-colors uppercase text-sm">Save & Re-Scan</button>
          </div>
        </div>
      )}

      {/* DARK TEAL HEADER */}
      <div className="bg-[#021F1E] border-b-2 border-[#D4AF37]/30 shadow-lg relative z-10 w-full">
        <header className="max-w-5xl mx-auto px-8 py-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-2xl font-light tracking-[0.25em] text-[#00FBB0] mb-3 uppercase flex items-center gap-3 drop-shadow-md">
              Jyotish Command <span className="text-[#D4AF37] text-sm">✦</span>
            </h1>
            <button onClick={() => setShowSettings(true)} className="text-xs text-[#89CFF0] hover:text-white font-medium transition-colors flex items-center gap-2 tracking-widest uppercase">
              Configure GPS & Natal Profile
            </button>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#063736] border border-[#00FBB0]/30 text-[#FAF9F6] font-medium px-4 py-2.5 rounded-none focus:outline-none focus:border-[#D4AF37] w-full md:w-auto cursor-pointer text-sm tracking-wide transition-colors"
            />
            <select 
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="bg-[#063736] border border-[#00FBB0]/30 text-[#FAF9F6] font-medium px-4 py-2.5 rounded-none focus:outline-none focus:border-[#D4AF37] cursor-pointer w-full md:w-auto text-sm tracking-wide transition-colors appearance-none"
            >
              {ACTIVITIES.map(act => <option key={act.id} value={act.id}>{act.label}</option>)}
            </select>
            <a 
              href={`/api/scanner?activity=${activity}&natal_nakshatra=${natalStar}&startDate=${startDate}&format=ics`}
              className="bg-[#0A4A49] text-[#00FBB0] hover:bg-[#00FBB0] hover:text-[#021F1E] px-6 py-2.5 rounded-none transition-colors flex items-center font-bold tracking-[0.2em] whitespace-nowrap uppercase text-[10px] shadow-sm"
            >
              Export .ICS
            </a>
          </div>
        </header>
      </div>

      {/* CREAM BODY CONTENT */}
      <div className="max-w-5xl mx-auto px-8 py-10">
        
        {/* SUCCESS CRITERIA PANEL */}
        <div className="mb-10 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-[#E0E7E7]">
          <div 
            className="flex justify-between items-center p-6 cursor-pointer hover:bg-[#FAF9F6] transition-colors"
            onClick={() => setShowCriteria(!showCriteria)}
          >
            <h3 className="text-[#0D5C58] font-medium text-xs tracking-[0.2em] uppercase">
              Classical Criteria
            </h3>
            <button className="text-[#7A8B8C] text-[10px] font-medium tracking-[0.2em] hover:text-[#0D5C58] transition-colors uppercase">
              {showCriteria ? 'Hide' : 'Show'}
            </button>
          </div>
          {showCriteria && (
            <div className="px-6 pb-6 pt-0 text-sm text-[#4A5D5C] leading-relaxed font-light tracking-wide">
              {ACTIVITY_LIBRARY[activity]?.description || "No classical description available for this activity."}
            </div>
          )}
        </div>

        {microData && (
          <div className="mb-12 bg-white p-8 relative shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-t-2 border-[#D4AF37]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-[#0D5C58] font-medium text-lg uppercase tracking-[0.15em]">
                  Optimized Timeline
                </h3>
                <span className="text-xs font-medium text-[#7A8B8C] tracking-widest mt-2 block uppercase">
                  {new Date(microData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • GPS: {lat}, {lon}
                </span>
              </div>
              <button 
                onClick={() => setMicroData(null)}
                className="text-[#7A8B8C] hover:text-[#1A2E26] text-[10px] font-medium tracking-[0.2em] uppercase transition-colors"
              >
                Close ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[2px] bg-[#E0E7E7] border border-[#E0E7E7]">
              {microData.windows.map((win, idx) => {
                const isFav = win.favorable_lagna;
                const hasCombo = Boolean(win.combination_active);

                return (
                  <div 
                    key={idx} 
                    className={`p-6 text-sm flex flex-col justify-between transition-colors ${
                      hasCombo 
                        ? 'bg-[#FCFBF4]' 
                        : isFav 
                          ? 'bg-white' 
                          : 'bg-[#FAF9F6] opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`font-medium tracking-wider ${hasCombo ? 'text-[#B8860B]' : 'text-[#1A2E26]'}`}>{win.start_time} – {win.end_time}</span>
                        {hasCombo ? (
                          <span className="text-[9px] px-2 py-1 bg-[#D4AF37]/10 text-[#B8860B] tracking-[0.2em] uppercase font-medium">Special Yoga</span>
                        ) : isFav ? (
                          <span className="text-[9px] text-[#0D5C58] tracking-[0.2em] uppercase font-medium">Favorable</span>
                        ) : (
                          <span className="text-[9px] text-[#7A8B8C] tracking-[0.2em] uppercase font-medium">Neutral</span>
                        )}
                      </div>
                      <div className={`text-xs font-light tracking-widest uppercase ${hasCombo ? 'text-[#1A2E26]' : isFav ? 'text-[#0D5C58]' : 'text-[#7A8B8C]'}`}>
                        Lagna: {win.lagna_name.split(' ')[0]}
                      </div>
                    </div>
                    {win.combination_active && (
                      <div className="mt-4 text-[11px] text-[#B8860B] font-medium tracking-wider uppercase">
                        ✦ {win.combination_active}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-32 text-[#0D5C58] font-medium tracking-[0.2em] uppercase flex flex-col items-center gap-6 text-sm">
            <svg className="animate-spin h-6 w-6 text-[#7A8B8C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Consulting Ephemeris
          </div>
        ) : windows.length === 0 ? (
          <div className="text-center py-32 text-[#7A8B8C] bg-white shadow-sm font-light tracking-[0.2em] uppercase text-sm border border-[#E0E7E7]">
            No viable windows found in the current horizon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {windows.map((win, idx) => {
              const displayDate = new Date(win.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
              return (
                <div key={idx} className="bg-white p-7 flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-[#E0E7E7]/50 hover:border-[#0D5C58]/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group duration-300">
                  <div>
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="font-medium text-lg text-[#1A2E26] tracking-wide uppercase">{displayDate}</h2>
                      {win.status === 'EXCELLENT' ? (
                        <span className="text-[10px] text-[#0D5C58] tracking-[0.2em] uppercase font-semibold flex items-center gap-1">
                          Excellent
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#D4AF37] tracking-[0.2em] uppercase font-semibold flex items-center gap-1">
                          ✦ Optimal
                        </span>
                      )}
                    </div>
                    <div className="space-y-4 text-[11px] mb-8 text-[#7A8B8C] font-medium tracking-[0.15em] uppercase">
                      <div className="flex justify-between items-center"><span>Vara</span><span className="text-[#1A2E26]">{win.vara_index}</span></div>
                      <div className="flex justify-between items-center"><span>Tithi</span><span className="text-[#1A2E26]">{win.tithi_index}</span></div>
                      <div className="flex justify-between items-center"><span>Nakshatra</span><span className="text-[#1A2E26]">{win.nakshatra_index}</span></div>
                      <div className="flex justify-between items-center pt-4 border-t border-[#E0E7E7]">
                        <span>Yoga</span>
                        <span className="text-[#0D5C58]">{win.yoga}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => optimizeTime(win.date)}
                    disabled={microLoading}
                    className="w-full bg-[#FAF9F6] group-hover:bg-[#0D5C58] group-hover:text-white text-[#7A8B8C] py-4 text-[10px] transition-colors duration-300 font-medium tracking-[0.2em] uppercase disabled:opacity-50"
                  >
                    {microLoading ? 'Calculating...' : 'Optimize Time'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
