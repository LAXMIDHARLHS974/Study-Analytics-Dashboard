import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTaskStore } from '../../store/useTaskStore';

export default function SubjectDonutChart() {
  const { subjects } = useTaskStore();

  const data = [
    { name: 'Mathematics', value: 38, color: '#5FB3B3' },
    { name: 'Physics', value: 26, color: '#6A9AC4' },
    { name: 'Computer Sci', value: 18, color: '#7B7FBF' },
    { name: 'Chemistry', value: 12, color: '#F6B26B' },
    { name: 'English', value: 6, color: '#4EBA88' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-slate-900/90 text-white p-2 rounded-xl text-xs backdrop-blur-md shadow-lg border border-slate-700">
          <span className="font-bold">{item.name}</span>: {item.value}% of time
        </div>
      );
    }
    return null;
  };

  return (
    <div className="clay-card p-4 sm:p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">
          Subject Distribution
        </h3>
        <span className="text-[11px] font-semibold text-slate-500">All Time</span>
      </div>

      {/* Donut and Legends Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Donut Chart */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={62}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    style={{ filter: 'drop-shadow(0px 3px 4px rgba(0,0,0,0.15))' }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center text in donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-slate-800 dark:text-white">5</span>
            <span className="text-[9px] text-slate-500 font-semibold uppercase">Subjects</span>
          </div>
        </div>

        {/* Legends on Right */}
        <div className="flex-1 space-y-1.5 pl-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate text-[11px] sm:text-xs">
                  {item.name}
                </span>
              </div>
              <span className="font-extrabold text-slate-600 dark:text-slate-400 text-[11px] sm:text-xs ml-1">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
