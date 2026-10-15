import React, { useState } from 'react';
import { format, subDays, parseISO, eachDayOfInterval } from 'date-fns';
import { useTaskStore } from '../../store/useTaskStore';
import { Flame, Trophy, Calendar } from 'lucide-react';

export default function StudyHeatmap() {
  const { timerLogs } = useTaskStore();
  const [hoveredDay, setHoveredDay] = useState(null);

  // Generate last 112 days (16 weeks x 7 days) for a rich grid layout
  const daysCount = 112;
  const today = new Date();
  const startDate = subDays(today, daysCount - 1);
  const allDays = eachDayOfInterval({ start: startDate, end: today });

  // Map logs by date
  const logMap = {};
  timerLogs.forEach((log) => {
    logMap[log.date] = log;
  });

  // Calculate intensity 0 - 4
  const getIntensity = (hours) => {
    if (!hours || hours === 0) return 0;
    if (hours < 2) return 1;
    if (hours < 4) return 2;
    if (hours < 6) return 3;
    return 4;
  };

  const getCellColor = (intensity) => {
    switch (intensity) {
      case 1: return 'bg-teal-200 dark:bg-teal-900/60 border border-teal-300 dark:border-teal-800';
      case 2: return 'bg-teal-400 dark:bg-teal-700 border border-teal-400';
      case 3: return 'bg-teal-600 dark:bg-teal-500 border border-teal-600';
      case 4: return 'bg-teal-800 dark:bg-teal-300 border border-teal-300';
      default: return 'bg-slate-200/60 dark:bg-slate-800/80 border border-slate-300/40 dark:border-slate-700/40';
    }
  };

  // Metrics
  const activeDaysCount = timerLogs.filter((l) => l.hours > 0).length;
  const totalHoursLogged = timerLogs.reduce((acc, l) => acc + (l.hours || 0), 0).toFixed(1);

  return (
    <div className="clay-card p-5 shadow-neu-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-teal" />
            <span>Study Consistency Heatmap</span>
          </h3>
          <p className="text-xs text-slate-500">
            {activeDaysCount} active study days • {totalHoursLogged} total hours logged
          </p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>7-Day Streak</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-purple/15 text-brand-purple text-xs font-bold border border-brand-purple/30">
            <Trophy className="w-3.5 h-3.5" />
            <span>Best: 14 Days</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative overflow-x-auto pb-2">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max mx-auto py-2">
          {allDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const log = logMap[dateStr];
            const hours = log ? log.hours : 0;
            const intensity = getIntensity(hours);

            return (
              <div
                key={dateStr}
                onMouseEnter={() => setHoveredDay({ dateStr, hours, log })}
                onMouseLeave={() => setHoveredDay(null)}
                className={`w-3.5 h-3.5 rounded-md cursor-pointer transition-all hover:scale-125 ${getCellColor(
                  intensity
                )}`}
              />
            );
          })}
        </div>

        {/* Hover Tooltip display */}
        {hoveredDay && (
          <div className="text-center mt-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span className="text-brand-teal font-bold">{hoveredDay.dateStr}:</span>{' '}
            {hoveredDay.hours > 0 ? (
              <span>
                {hoveredDay.hours} hours logged{' '}
                {hoveredDay.log?.tasksCompleted ? `(${hoveredDay.log.tasksCompleted} tasks completed)` : ''}
              </span>
            ) : (
              <span className="text-slate-400">Rest day / No hours recorded</span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
        <span>Less</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-slate-200/60 dark:bg-slate-800" />
          <div className="w-3 h-3 rounded-sm bg-teal-200 dark:bg-teal-900/60" />
          <div className="w-3 h-3 rounded-sm bg-teal-400 dark:bg-teal-700" />
          <div className="w-3 h-3 rounded-sm bg-teal-600 dark:bg-teal-500" />
          <div className="w-3 h-3 rounded-sm bg-teal-800 dark:bg-teal-300" />
        </div>
        <span>More (6h+)</span>
      </div>
    </div>
  );
}
