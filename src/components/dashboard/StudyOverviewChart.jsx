import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { INITIAL_WEEKLY_HOURS } from '../../data/seed';

export default function StudyOverviewChart() {
  const [timeRange, setTimeRange] = useState('This Week');

  // Multiplier for previewing last week or this month
  const data = INITIAL_WEEKLY_HOURS.map((item) => ({
    ...item,
    displayHours: timeRange === 'Last Week' ? Number((item.hours * 0.85).toFixed(1)) : item.hours,
  }));

  // Bar colors matching the soft teal-to-blue-to-purple sequence from screenshot
  const barColors = [
    '#A0D0D0', // Mon
    '#68C2C2', // Tue
    '#5FB3B3', // Wed
    '#4899A8', // Thu
    '#5889B6', // Fri
    '#6A9AC4', // Sat
    '#7B7FBF', // Sun
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900/90 text-white p-2.5 rounded-xl shadow-xl text-xs backdrop-blur-md border border-slate-700">
          <p className="font-bold text-brand-teal">{d.day}</p>
          <p className="text-white font-extrabold text-sm mt-0.5">{d.displayHours} hours</p>
          <p className="text-[10px] text-slate-400">Target: {d.target}h</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="clay-card p-4 sm:p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">
            Study Overview
          </h3>
          <p className="text-xs text-slate-500">Weekly study hours</p>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg neu-pill-btn border border-white/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="This Week">This Week</option>
          <option value="Last Week">Last Week</option>
        </select>
      </div>

      {/* Bar Chart Container */}
      <div className="h-48 sm:h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8094A8', fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8094A8', fontSize: 10 }}
              tickFormatter={(v) => `${v}h`}
              domain={[0, 8]}
              ticks={[0, 2, 4, 6]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.2)', radius: 4 }} />
            <Bar dataKey="displayHours" radius={[3, 3, 3, 3]} maxBarSize={32}>
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={barColors[index % barColors.length]} 
                  style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.12))' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
