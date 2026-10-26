import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../../store/useTaskStore';
import { calculateSubjectDistribution } from '../../utils/studyStats';
import { PieChart as PieIcon, Sparkles } from 'lucide-react';

const CustomDonutTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-slate-900/95 text-white p-2.5 rounded-xl text-xs backdrop-blur-md shadow-xl border border-slate-700">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-bold text-slate-100">{item.name}</span>
        </div>
        <div className="text-[11px] text-slate-300">
          <span className="font-extrabold text-brand-teal text-sm">{item.hours} hrs</span>
          <span className="text-slate-400 ml-1.5">({item.value}% of time)</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function SubjectDonutChart() {
  const navigate = useNavigate();
  const { subjects, timerLogs } = useTaskStore();
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'month' | 'week' | 'today'
  const [hoveredEntry, setHoveredEntry] = useState(null);

  // Compute dynamic subject distribution based on study time and subject
  const {
    distribution,
    activeDistribution,
    totalHours,
    activeCount,
  } = calculateSubjectDistribution(timerLogs, subjects, timeFilter);

  // Center display content
  const centerTitle = hoveredEntry
    ? `${hoveredEntry.hours}h`
    : `${totalHours}h`;
  const centerSubtitle = hoveredEntry
    ? hoveredEntry.name
    : `${activeCount} ${activeCount === 1 ? 'Subject' : 'Subjects'}`;

  return (
    <div className="clay-card p-4 sm:p-5 flex flex-col justify-between h-full shadow-neu-card">
      {/* Header with Title and Time Filter */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <PieIcon className="w-4 h-4 text-brand-teal" />
            <span>Subject Distribution</span>
          </h3>
        </div>

        {/* Time Filter Select */}
        <div className="flex items-center gap-1">
          <select
            value={timeFilter}
            onChange={(e) => {
              setTimeFilter(e.target.value);
              setHoveredEntry(null);
            }}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg neu-pill-btn border border-white/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
            <option value="today">Today</option>
          </select>
        </div>
      </div>

      {distribution.length > 0 ? (
        /* Donut Chart and Legends Row */
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 flex-1">
          {/* Donut Chart */}
          <div className="w-36 h-36 sm:w-44 sm:h-44 relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomDonutTooltip />} />
                <Pie
                  data={
                    totalHours > 0
                      ? activeDistribution
                      : distribution.map((d) => ({ ...d, chartValue: 1 }))
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={62}
                  paddingAngle={distribution.length > 1 ? 4 : 0}
                  dataKey={totalHours > 0 ? 'hours' : 'chartValue'}
                  stroke="none"
                  onMouseEnter={(_, index) => {
                    const list = totalHours > 0 ? activeDistribution : distribution;
                    setHoveredEntry(list[index]);
                  }}
                  onMouseLeave={() => setHoveredEntry(null)}
                >
                  {(totalHours > 0 ? activeDistribution : distribution).map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}-${index}`}
                      fill={entry.color}
                      opacity={totalHours > 0 ? 1 : 0.65}
                      style={{
                        filter: hoveredEntry?.name === entry.name
                          ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.3)) scale(1.05)'
                          : 'drop-shadow(0px 3px 4px rgba(0,0,0,0.15))',
                        transition: 'all 0.2s ease-out',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center text in donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2 text-center">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">
                {centerTitle}
              </span>
              <span className="text-[9px] text-slate-500 font-bold uppercase truncate max-w-[80px]">
                {hoveredEntry ? hoveredEntry.name : `${distribution.length} ${distribution.length === 1 ? 'Subject' : 'Subjects'}`}
              </span>
            </div>
          </div>

          {/* Legends on Right */}
          <div className="w-full sm:flex-1 space-y-1.5 pl-0 sm:pl-2 max-h-48 overflow-y-auto pr-1">
            {distribution.map((item) => {
              const isHovered = hoveredEntry?.name === item.name;
              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setHoveredEntry(item)}
                  onMouseLeave={() => setHoveredEntry(null)}
                  className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isHovered
                      ? 'bg-slate-200/60 dark:bg-slate-800/80'
                      : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate text-[11px] sm:text-xs">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    <span className="font-bold text-slate-500 dark:text-slate-400 text-[10px]">
                      {item.hours}h
                    </span>
                    <span className="font-extrabold text-slate-800 dark:text-white text-[11px] sm:text-xs min-w-[28px] text-right">
                      {item.value}%
                    </span>
                  </div>
                </div>
              );
            })}

            {totalHours === 0 && (
              <div className="pt-1 text-center">
                <button
                  onClick={() => navigate('/today')}
                  className="text-[11px] font-semibold text-brand-teal hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-brand-teal" />
                  <span>Plan study tasks today</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty state when user has no subjects at all */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-teal/15 text-brand-teal flex items-center justify-center shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
              No Subjects Added
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-[220px]">
              Add your subjects to track study time distribution and focus sprints.
            </p>
          </div>
          <button
            onClick={() => navigate('/subjects')}
            className="neu-teal-btn px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <span>+ Add Your First Subject</span>
          </button>
        </div>
      )}
    </div>
  );
}
