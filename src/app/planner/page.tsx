"use client";

import { useState, useEffect } from 'react';

const ACTIVITIES = [
  { key: 'business', label: 'Business / Commerce' },
  { key: 'travel', label: 'Travel / Yatra' },
  { key: 'property', label: 'Property Purchasing' },
  { key: 'litigation', label: 'Litigation (Plaintiff)' },
  { key: 'hair_cutting', label: 'Hair & Beard Cutting' },
  { key: 'nail_cutting', label: 'Nail Cutting' },
  { key: 'oil_bath', label: 'Oil Bath' },
  { key: 'education', label: 'Education / Learning' },
];

type ViableWindow = {
  date: string;
  tithi_index: number;
  nakshatra_index: number;
  vara_index: number;
  status: string;
  yoga: string;
};

export default function Planner() {
  const [selectedActivity, setSelectedActivity] = useState<string>('business');
  const [windows, setWindows] = useState<ViableWindow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWindows = async (activityKey: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/scanner?activity=${activityKey}`);
      const data = await res.json();
      setWindows(data.viable_windows || []);
    } catch (err) {
      console.error(err);
      setWindows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWindows(selectedActivity);
  }, [selectedActivity]);

  const downloadICS = () => {
    window.location.href = `/api/scanner?activity=${selectedActivity}&format=ics`;
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 border border-green-500/30 rounded bg-black/80 p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8 border-b border-green-500/30 pb-6">
            <div>
              <div className="text-green-300 text-2xl font-bold tracking-widest">JYOTISH PLANNER</div>
              <div className="text-green-500/60 text-sm">Find auspicious windows • Filter by activity</div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="bg-black border border-green-500/50 text-green-400 px-4 py-2 rounded focus:outline-none focus:border-green-400"
              >
                {ACTIVITIES.map((act) => (
                  <option key={act.key} value={act.key}>
                    {act.label}
                  </option>
                ))}
              </select>
              <button
                onClick={downloadICS}
                className="bg-green-900 hover:bg-green-800 border border-green-400 text-green-300 px-6 py-2 rounded text-sm transition-colors"
              >
                ↓ ICS CALENDAR
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12 text-green-500/60">
              Scanning next 60 days...
            </div>
          )}

          {!loading && windows.length === 0 && (
            <div className="text-center py-12 text-orange-400">
              No auspicious windows found for this activity in the next 60 days.
            </div>
          )}

          {!loading && windows.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {windows.map((win, i) => {
                const d = new Date(win.date);
                return (
                  <div
                    key={i}
                    className="border border-green-500/30 bg-black/50 p-5 rounded hover:border-green-400 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-green-300 font-bold text-lg">
                          {d.toLocaleDateString('en-IN', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="text-green-500/70 text-xs">
                          {d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
                        </div>
                      </div>
                      <div className={`px-3 py-1 text-xs font-bold rounded ${
                        win.status === 'EXCELLENT' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                      }`}>
                        {win.status}
                      </div>
                    </div>

                    <div className="text-[13px] space-y-1 text-green-400/90">
                      <div>Yoga: <span className="text-green-300">{win.yoga}</span></div>
                      <div>Nakshatra: {win.nakshatra_index} • Tithi: {win.tithi_index}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-10 text-[10px] text-green-500/40 border-t border-green-500/20 pt-4">
            Powered by existing /api/scanner endpoint • Real-time Vedic calculations
          </div>
        </div>
      </div>
    </div>
  );
}
