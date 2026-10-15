import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export default function CompletionTrendChart() {
  const trendData = [
    { week: 'W1 Sep', planned: 20, completed: 18, rate: 90 },
    { week: 'W2 Sep', planned: 24, completed: 21, rate: 87 },
    { week: 'W3 Sep', planned: 26, completed: 25, rate: 96 },
    { week: 'W4 Sep', planned: 25, completed: 22, rate: 88 },
    { week: 'W1 Oct', planned: 28, completed: 26, rate: 92 },
    { week: 'W2 Oct', planned: 28, completed: 27, rate: 96 },
    { week: 'W3 Oct', planned: 30, completed: 28, rate: 93 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/90 text-white p-2.5 rounded-xl shadow-xl text-xs backdrop-blur-md border border-slate-700">
          <p className="font-bold text-brand-teal">{data.week}</p>
          <p className="text-emerald-400 font-semibold">Completed: {data.completed} tasks</p>
          <p className="text-slate-300">Planned: {data.planned} tasks</p>
          <p className="text-amber-400 font-bold mt-1">Completion Rate: {data.rate}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="clay-card p-4 sm:p-5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">
            Task Completion Trend
          </h3>
          <p className="text-xs text-slate-500">Planned vs Completed tasks weekly</p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          93% Avg Rate
        </span>
      </div>

      <div className="h-48 sm:h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 170, 190, 0.2)" />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8094A8', fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8094A8', fontSize: 10 }}
              domain={[10, 35]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="planned"
              stroke="#A0B4C8"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#5FB3B3"
              strokeWidth={3}
              dot={{ r: 4, fill: '#5FB3B3', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
