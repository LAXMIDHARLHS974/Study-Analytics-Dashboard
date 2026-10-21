import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { TrendingUp, CheckCircle2, Target, Calendar, Sparkles } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { calculateTaskCompletionTrend } from '../../utils/studyStats';

export default function CompletionTrendChart() {
  const { tasks, timerLogs } = useTaskStore();
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' | 'daily' | 'monthly'

  const { data, totalPlanned, totalCompleted, overallRate, currentRate } = 
    calculateTaskCompletionTrend(tasks, timerLogs, viewMode);

  // Custom Glassmorphic Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const rateColor = d.rate >= 90 
        ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
        : d.rate >= 70
        ? 'text-teal-400 bg-teal-500/20 border-teal-500/30'
        : 'text-amber-400 bg-amber-500/20 border-amber-500/30';

      return (
        <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white p-3 rounded-2xl shadow-2xl text-xs backdrop-blur-xl border border-white/15 min-w-[170px] animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10">
            <span className="font-extrabold text-white text-xs">{d.label}</span>
            <span className="text-[10px] text-slate-400">{d.range || d.fullDate}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                Completed
              </span>
              <span className="font-bold text-white text-xs">{d.completed} tasks</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Planned
              </span>
              <span className="font-bold text-slate-300 text-xs">{d.planned} tasks</span>
            </div>

            {d.hours > 0 && (
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span>Logged Study:</span>
                <span className="font-bold text-slate-200">{d.hours}h</span>
              </div>
            )}
          </div>

          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">Completion Rate:</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${rateColor}`}>
              {d.rate}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="clay-card p-4 sm:p-5 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Background ambient decorative glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white tracking-tight">
              Task Completion Trend
            </h3>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shrink-0">
          {[
            { id: 'weekly', label: 'Weekly' },
            { id: 'daily', label: '14 Days' },
            { id: 'monthly', label: 'Monthly' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                viewMode === mode.id
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm border border-slate-200/50 dark:border-white/10'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Strip */}
      <div className="grid grid-cols-3 gap-2 py-2 mb-2 border-y border-slate-200/50 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Completed</span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white">
              {totalCompleted} <span className="text-[10px] font-medium text-slate-400">tasks</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Planned</span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white">
              {totalPlanned} <span className="text-[10px] font-medium text-slate-400">tasks</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Rate</span>
            <span className="text-xs sm:text-sm font-extrabold text-teal-600 dark:text-teal-400">
              {overallRate}% <span className="text-[10px] font-medium text-slate-400">avg</span>
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-48 sm:h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: -22, bottom: 0 }}>
            <defs>
              {/* Completed Gradient */}
              <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              {/* Planned Gradient */}
              <linearGradient id="plannedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818CF8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#818CF8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8094A8', fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tick={{ fill: '#8094A8', fontSize: 10 }}
              domain={[0, (dataMax) => Math.max(4, Math.ceil(dataMax * 1.2))]}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Planned Line & Area */}
            <Area
              type="monotone"
              dataKey="planned"
              name="Planned Tasks"
              stroke="#818CF8"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#plannedGrad)"
              dot={{ r: 3, fill: '#818CF8', strokeWidth: 1.5, stroke: '#ffffff' }}
            />

            {/* Completed Line & Area */}
            <Area
              type="monotone"
              dataKey="completed"
              name="Completed Tasks"
              stroke="#10B981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#completedGrad)"
              dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#10B981', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-2.5 mt-2 border-t border-slate-200/50 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            <span className="text-slate-700 dark:text-slate-300">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 border-t-2 border-dashed border-indigo-400" />
            <span className="text-slate-700 dark:text-slate-300">Planned</span>
          </div>
        </div>

        <span className="text-[10px] text-slate-400">
          Current: <strong className="text-emerald-500 dark:text-emerald-400 font-extrabold">{currentRate}%</strong>
        </span>
      </div>
    </div>
  );
}
