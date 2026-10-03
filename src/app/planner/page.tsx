"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ACTIVITY_LIBRARY } from '@/lib/engine/activities';

const ACTIVITIES = [
  { id: 'business', label: 'Business / Commerce' },
  { id: 'travel', label: 'Travel / Yātrā' },
  { id: 'property', label: 'Property Purchasing' },
  { id: 'litigation', label: 'Litigation (Plaintiff)' },
  { id: 'hair_cutting', label: 'Hair & Beard Cutting' },
  { id: 'nail_cutting', label: 'Nail Cutting' },
  { id: 'oil_bath', label: 'Oil Bath (Abhyaṅga)' },
  { id: 'education', label: 'Education / Vidyā' },
  { id: 'paying_debts', label: 'Paying Debts' }
];

const IAST_VARAS = ["Ravivāra", "Somavāra", "Maṅgalavāra", "Budhavāra", "Guruvāra", "Śukravāra", "Śanivāra"];
const IAST_TITHIS = ["Pratipat", "Dvitīyā", "Tṛtīyā", "Caturthī", "Pañcamī", "Ṣaṣṭhī", "Saptamī", "Aṣṭamī", "Navamī", "Daśamī", "Ekādaśī", "Dvādaśī", "Trayodaśī", "Caturdaśī"];
const IAST_NAKSHATRAS = ["Aśvinī", "Bharaṇī", "Kṛttikā", "Rohiṇī", "Mṛgaśīrṣa", "Ārdrā", "Punarvasu", "Puṣya", "Āśleṣā", "Maghā", "Pūrva Phalgunī", "Uttara Phalgunī", "Hasta", "Citrā", "Svātī", "Viśākhā", "Anurādhā", "Jyeṣṭhā", "Mūla", "Pūrvāṣāḍhā", "Uttarāṣāḍhā", "Śravaṇa", "Dhaniṣṭhā", "Śatabhiṣak", "Pūrva Bhādrapadā", "Uttara Bhādrapadā", "Revatī"];

export default function Planner() {
  const [mounted, setMounted] = useState(false);
  const [activity, setActivity] = useState('travel');
  const [startDate, setStartDate] = useState("");
  const [windows, setWindows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCriteria, setShowCriteria] = useState(true);
  
  const [showSettings, setShowSettings] = useState(false);
  const [lat, setLat] = useState("51.6242");
  const [lon, setLon] = useState("0.0604");
  const [natalStar, setNatalStar] = useState("11");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [cityResults, setCityResults] = useState<any[]>([]);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [microData, setMicroData] = useState<{date: string, windows: any[]} | null>(null);
  const [microLoading, setMicroLoading] = useState(false);

  useEffect(() => {
    setLat(localStorage.getItem('jyotish_lat') || "51.6242");
    setLon(localStorage.getItem('jyotish_lon') || "0.0604");
    setNatalStar(localStorage.getItem('jyotish_star') || "11");
    setSearchQuery(localStorage.getItem('jyotish_city') || "London, United Kingdom");
    setStartDate(new Date().toISOString().split('T')[0]);
    setMounted(true);
  }, []);

  const searchCities = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setCityResults([]);
      return;
    }
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&format=json`);
      const data = await res.json();
      setCityResults(data.results || []);
    } catch (e) {
      console.error(e);
    }
  };

  const selectCity = (city: any) => {
    setLat(city.latitude.toString());
    setLon(city.longitude.toString());
    const locationString = `${city.name}, ${city.admin1 ? city.admin1 + ', ' : ''}${city.country}`;
    setSearchQuery(locationString);
    localStorage.setItem('jyotish_city', locationString);
    setCityResults([]);
  };

  const saveSettings = () => {
    localStorage.setItem('jyotish_lat', lat);
    localStorage.setItem('jyotish_lon', lon);
    localStorage.setItem('jyotish_star', natalStar);
    setShowSettings(false);
    setExpandedIndex(null);
    fetchWindows(activity, startDate);
  };

  const fetchWindows = async (selectedActivity: string, start: string) => {
    if (!start) return;
    setLoading(true);
    setMicroData(null);
    setExpandedIndex(null);
    try {
      const res = await fetch(`/api/scanner?activity=${selectedActivity}&natal_nakshatra=${natalStar}&startDate=${start}&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      setWindows(data.viable_windows || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const optimizeTime = async (date: string, idx: number) => {
    if (expandedIndex === idx) {
      setExpandedIndex(null);
      setMicroData(null);
      return;
    }
    setExpandedIndex(idx);
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
    if (mounted && lat && lon && startDate) fetchWindows(activity, startDate);
  }, [activity, lat, lon, startDate, mounted]);

  const getSuffix = (n: number) => {
    if (n >= 11 && n <= 13) return 'th';
    switch (n % 10) { case 1: return "st"; case 2: return "nd"; case 3: return "rd"; default: return "th"; }
  };

  if (!mounted) return <div className="min-h-screen bg-[#FAF9F6]"></div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A2E26] font-serif relative selection:bg-[#00FBB0] selection:text-[#021F1E]">
      
      {showSettings && (
        <div className="fixed inset-0 bg-[#021F1E]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-10 rounded-none bg-[#063736] max-w-md w-full shadow-2xl relative border border-[#00FBB0]/20 font-sans">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#89CFF0] via-[#D4AF37] to-[#00FBB0]"></div>
            <h2 className="text-lg font-medium mb-8 text-[#00FBB0] tracking-[0.2em] uppercase">Engine Configuration</h2>
            <div className="space-y-6 mb-10">
              <div className="relative">
                <label className="block text-xs font-medium mb-2 text-[#89CFF0] uppercase tracking-widest">Observer Location</label>
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={e => searchCities(e.target.value)} 
                  placeholder="Search city..."
                  className="w-full bg-[#021F1E] border-none rounded-none px-4 py-3 text-[#FAF9F6] focus:outline-none focus:ring-1 focus:ring-[#00FBB0] transition-shadow" 
                />
                {cityResults.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white text-[#1A2E26] shadow-lg z-50 max-h-48 overflow-y-auto border border-[#E0E7E7]">
                    {cityResults.map((city, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => selectCity(city)}
                        className="px-4 py-3 hover:bg-[#E0E7E7] cursor-pointer text-sm border-b border-[#E0E7E7] last:border-none"
                      >
                        <span className="font-medium">{city.name}</span>
                        <span className="text-xs text-[#7A8B8C] block">{city.admin1 ? city.admin1 + ', ' : ''}{city.country}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-2 text-[#89CFF0] uppercase tracking-widest">Natal Nakṣatra</label>
                <select 
                  value={natalStar} 
                  onChange={e => setNatalStar(e.target.value)} 
                  className="w-full bg-[#021F1E] border-none rounded-none px-4 py-3 text-[#FAF9F6] focus:outline-none focus:ring-1 focus:ring-[#00FBB0] transition-shadow appearance-none cursor-pointer"
                >
                  {IAST_NAKSHATRAS.map((nak, idx) => (
                    <option key={idx} value={idx}>{idx + 1} - {nak}</option>
                  ))}
                </select>
              </div>
            </div>
            <button onClick={saveSettings} className="w-full bg-[#00FBB0] text-[#021F1E] py-4 rounded-none font-bold tracking-[0.2em] hover:bg-white transition-colors uppercase text-sm">Save & Re-Scan</button>
          </div>
        </div>
      )}

      <div className="bg-[#021F1E] border-b-2 border-[#D4AF37]/30 shadow-lg relative z-10 w-full font-sans">
        <header className="max-w-5xl mx-auto px-8 py-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <Link href="/" className="text-xs text-[#89CFF0] hover:text-[#00FBB0] font-medium transition-colors flex items-center gap-1 tracking-widest uppercase">
                ⌂ Home
              </Link>
            </div>
            <h1 className="text-2xl font-light tracking-[0.25em] text-[#00FBB0] mb-3 uppercase flex items-center gap-3 drop-shadow-md">
              Jyotish Command <span className="text-[#D4AF37] text-sm">v2.1 ✦</span>
            </h1>
            <button onClick={() => setShowSettings(true)} className="text-xs text-[#89CFF0] hover:text-white font-medium transition-colors flex items-center gap-2 tracking-widest uppercase">
              Configure GPS & Natal Profile
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#063736] border border-[#00FBB0]/30 text-[#FAF9F6] font-medium px-4 py-2.5 rounded-none focus:outline-none focus:border-[#D4AF37] w-full sm:w-auto cursor-pointer text-sm tracking-wide transition-colors"
            />
            <select 
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="bg-[#063736] border border-[#00FBB0]/30 text-[#FAF9F6] font-medium px-4 py-2.5 rounded-none focus:outline-none focus:border-[#D4AF37] cursor-pointer w-full sm:w-auto text-sm tracking-wide transition-colors appearance-none"
            >
              {ACTIVITIES.map(act => <option key={act.id} value={act.id}>{act.label}</option>)}
            </select>
          </div>
        </header>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-10 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-[#E0E7E7] font-sans">
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
            <div className="px-6 pb-6 pt-0 text-sm text-[#4A5D5C] leading-relaxed font-light tracking-wide font-serif">
              {ACTIVITY_LIBRARY[activity]?.description || "No classical description available for this activity."}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-32 text-[#0D5C58] font-sans font-medium tracking-[0.2em] uppercase flex flex-col items-center gap-6 text-sm">
            <svg className="animate-spin h-6 w-6 text-[#7A8B8C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Consulting Ephemeris
          </div>
        ) : windows.length === 0 ? (
          <div className="text-center py-32 text-[#7A8B8C] bg-white shadow-sm font-sans font-light tracking-[0.2em] uppercase text-sm border border-[#E0E7E7]">
            No strictly optimal windows found in the current 60-day horizon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {windows.map((win, idx) => {
              const displayDate = new Date(win.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
              
              const varaName = IAST_VARAS[win.vara_index];
              const tithiPhaseNum = win.tithi_index <= 15 ? win.tithi_index : win.tithi_index - 15;
              const paksa = win.tithi_index <= 15 ? 'Śukla' : 'Kṛṣṇa';
              
              let tithiName = "";
              if (win.tithi_index === 15) tithiName = "Pūrṇimā";
              else if (win.tithi_index === 30) tithiName = "Amāvasyā";
              else tithiName = IAST_TITHIS[tithiPhaseNum - 1];
              
              const displayTithi = (win.tithi_index === 15 || win.tithi_index === 30) 
                  ? `${tithiName} (${tithiPhaseNum}${getSuffix(tithiPhaseNum)})` 
                  : `${tithiName} ${paksa} Pakṣa (${tithiPhaseNum}${getSuffix(tithiPhaseNum)})`;

              const nakName = IAST_NAKSHATRAS[win.nakshatra_index];
              const isExpanded = expandedIndex === idx;

              return (
                <React.Fragment key={idx}>
                  <div className={`bg-white p-7 flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border transition-all group duration-300 ${isExpanded ? 'border-[#0D5C58]' : win.status === 'DANGER' ? 'border-red-500/30 bg-red-50/30' : 'border-[#E0E7E7]/50 hover:border-[#0D5C58]/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'}`}>
                    <div>
                      <div className="flex justify-between items-center mb-6 font-sans">
                        <h2 className={`font-medium text-lg tracking-wide uppercase ${win.status === 'DANGER' ? 'text-red-900' : 'text-[#1A2E26]'}`}>{displayDate}</h2>
                        {win.status === 'EXCELLENT' ? (
                          <span className="text-[10px] text-[#0D5C58] tracking-[0.2em] uppercase font-semibold flex items-center gap-1">Excellent</span>
                        ) : win.status === 'DANGER' ? (
                          <span className="text-[10px] text-red-600 tracking-[0.2em] uppercase font-semibold flex items-center gap-1">⚠️ Danger</span>
                        ) : (
                          <span className="text-[10px] text-[#D4AF37] tracking-[0.2em] uppercase font-semibold flex items-center gap-1">✦ Optimal</span>
                        )}
                      </div>
                      
                      {win.combo_name && (
                        <div className={`text-[10px] font-bold tracking-widest uppercase mb-6 ${win.status === 'DANGER' ? 'text-red-600' : 'text-[#B8860B]'}`}>
                          {win.status === 'DANGER' ? '⚠️' : '✦'} {win.combo_name}
                        </div>
                      )}

                      <div className="space-y-4 text-[13px] mb-8 text-[#4A5D5C] font-serif">
                        <div className="flex justify-between items-center border-b border-[#E0E7E7]/50 pb-2"><span className="text-[#7A8B8C] font-sans text-[10px] uppercase tracking-widest">Vāra</span><span className="text-[#1A2E26]">{varaName}</span></div>
                        <div className="flex justify-between items-center border-b border-[#E0E7E7]/50 pb-2"><span className="text-[#7A8B8C] font-sans text-[10px] uppercase tracking-widest">Tithi</span><span className="text-[#1A2E26]">{displayTithi}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[#7A8B8C] font-sans text-[10px] uppercase tracking-widest">Nakṣatra</span><span className="text-[#1A2E26]">{nakName}</span></div>
                      </div>
                    </div>
                    <button 
                      onClick={() => optimizeTime(win.date, idx)}
                      disabled={microLoading && expandedIndex === idx}
                      className={`w-full py-4 text-[10px] transition-colors duration-300 font-sans font-medium tracking-[0.2em] uppercase disabled:opacity-50 ${isExpanded ? 'bg-[#0D5C58] text-white' : win.status === 'DANGER' ? 'bg-red-50 text-red-700 group-hover:bg-red-600 group-hover:text-white' : 'bg-[#FAF9F6] group-hover:bg-[#0D5C58] group-hover:text-white text-[#7A8B8C]'}`}
                    >
                      {microLoading && expandedIndex === idx ? 'Calculating...' : isExpanded ? 'Close Timeline ✕' : 'Optimize Time'}
                    </button>
                  </div>

                  {/* INLINE MICRO-TIMELINE DROP DOWN */}
                  {isExpanded && microData && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-8 relative shadow-inner border-y-2 border-[#D4AF37] font-sans animate-in fade-in slide-in-from-top-4 duration-300 mb-6">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <h3 className="text-[#0D5C58] font-medium text-lg uppercase tracking-[0.15em]">
                            Local Timeline Breakdown
                          </h3>
                          <span className="text-xs font-medium text-[#7A8B8C] tracking-widest mt-2 block uppercase">
                            {new Date(microData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {searchQuery}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-[#E0E7E7] border border-[#E0E7E7]">
                        {microData.windows.map((w, microIdx) => {
                          const isFav = w.favorable_lagna;
                          const isAvoid = w.combination_active.includes('Avoid');
                          return (
                            <div key={microIdx} className={`p-4 text-sm flex flex-col justify-between transition-colors ${isAvoid ? 'bg-red-50/50' : isFav ? 'bg-white' : 'bg-[#FAF9F6] opacity-60'}`}>
                              <div className="flex justify-between items-center mb-2">
                                <span className={`text-[11px] font-medium tracking-wider ${isAvoid ? 'text-red-900' : isFav ? 'text-[#1A2E26]' : 'text-[#7A8B8C]'}`}>{w.start_time}</span>
                                {isAvoid ? (
                                  <span className="text-[9px] text-red-600 tracking-[0.2em] uppercase font-bold">Avoid</span>
                                ) : isFav ? (
                                  <span className="text-[9px] text-[#D4AF37] tracking-[0.2em] uppercase font-bold">Śubha</span>
                                ) : (
                                  <span className="text-[9px] text-[#7A8B8C] tracking-[0.2em] uppercase font-medium">Neutral</span>
                                )}
                              </div>
                              <div className={`text-[13px] font-serif ${isAvoid ? 'text-red-800' : isFav ? 'text-[#0D5C58]' : 'text-[#7A8B8C]'}`}>
                                Lagna: {w.lagna_name.split(' ')[0]}
                              </div>
                              {w.combination_active && (
                                <div className={`mt-2 text-[9px] font-bold tracking-widest uppercase ${isAvoid ? 'text-red-600' : 'text-[#B8860B]'}`}>
                                  {w.combination_active}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
