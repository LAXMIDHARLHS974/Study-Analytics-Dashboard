import React, { useState } from 'react';
import { CheckCircle2, Clock, Flame, ListTodo, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useTaskStore } from '../../store/useTaskStore';
import { calculateStreak, calculateStudyHours } from '../../utils/studyStats';

const MOTIVATIONAL_LINES = [
  "Discipline will take you places where motivation can't.",
  'Small daily steps compound into massive success.',
  'Consistency beats intensity every single day.',
  'Focus on progress, not perfection.',
  'Your future self will thank you for today’s effort.',
];

export default function HeroBanner() {
  const { tasks, timerLogs } = useTaskStore();
  const [quoteIdx, setQuoteIdx] = useState(0);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const completedTasks = tasks.filter((t) => t.status === 'Done');
  const todayPendingTasks = tasks.filter((t) => t.date === todayStr && t.status !== 'Done');

  const { thisWeekHours, weeklyDelta } = calculateStudyHours(timerLogs);
  const { currentStreak, studiedToday } = calculateStreak(timerLogs, tasks);

  const stats = [
    {
      id: 'tasks-completed',
      title: 'Tasks Completed',
      value: `${completedTasks.length}`,
      subtext: completedTasks.length > 0 ? `${completedTasks.length} done` : 'No tasks done yet',
      icon: CheckCircle2,
      iconBg: 'bg-gradient-to-tr from-[#2563EB] to-[#60A5FA]',
      badgeColor: 'text-royal-700 dark:text-royal-300 bg-royal-500/15 border border-royal-500/30',
    },
    {
      id: 'study-hours',
      title: 'Study Hours',
      value: `${thisWeekHours}`,
      unit: 'hrs',
      subtext: `${weeklyDelta >= 0 ? '+' : ''}${weeklyDelta}h vs last week`,
      icon: Clock,
      iconBg: 'bg-gradient-to-tr from-[#1D4ED8] to-[#3B82F6]',
      badgeColor: 'text-blue-700 dark:text-blue-300 bg-blue-500/15 border border-blue-500/30',
    },
    {
      id: 'streak',
      title: 'Current Streak',
      value: `${currentStreak}`,
      unit: currentStreak === 1 ? 'day' : 'days',
      subtext: studiedToday ? 'Active today 🔥' : currentStreak > 0 ? 'Study to keep 🔥' : 'Start streak today',
      icon: Flame,
      iconBg: 'bg-gradient-to-tr from-[#7C3AED] to-[#A855F7]',
      badgeColor: 'text-violet-700 dark:text-violet-neon-bright bg-violet-neon/15 border border-violet-neon/30',
    },
    {
      id: 'pending-tasks',
      title: 'Pending Tasks',
      value: `${todayPendingTasks.length}`,
      subtext:
        todayPendingTasks.length === 1
          ? '1 task left'
          : todayPendingTasks.length === 0
            ? 'All caught up 🎉'
            : `${todayPendingTasks.length} tasks left`,
      icon: ListTodo,
      iconBg: 'bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6]',
      badgeColor: 'text-purple-700 dark:text-purple-300 bg-purple-500/15 border border-purple-500/30',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl clay-card p-3 sm:p-4 shadow-neu-card border border-white/60 dark:border-slate-700/60 transition-all">
      {/* Background soft ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/10 via-transparent to-teal-500/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-stretch gap-3 sm:gap-4">
        {/* Left: Motivational Study Photo + Compact Motivation Line */}
        <div className="w-full lg:w-4/12 flex flex-col justify-between gap-2.5 shrink-0">
          <div className="relative flex-1 rounded-xl overflow-hidden shadow-md group">
            <img
              src="/assets/motivational_study.jpg"
              alt="Discipline Beats Motivation - Study Setup"
              className="w-full h-36 sm:h-40 lg:h-full lg:max-h-[168px] object-cover rounded-xl group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </div>

          <div className="px-3 py-2 rounded-xl neu-inset flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-brand-teal shrink-0" />
              <p className="text-[11px] font-semibold italic text-slate-700 dark:text-slate-200 line-clamp-2 leading-snug">
                "{MOTIVATIONAL_LINES[quoteIdx]}"
              </p>
            </div>
            <button
              type="button"
              onClick={() => setQuoteIdx((prev) => (prev + 1) % MOTIVATIONAL_LINES.length)}
              className="p-1.5 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-brand-teal transition-colors shrink-0"
              title="Next motivational line"
              aria-label="Next motivational line"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: 4 Stat Boxes in a 2x2 Grid */}
        <div className="flex-1 w-full grid grid-cols-2 gap-2 sm:gap-2.5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="p-2.5 sm:p-3 rounded-xl bg-white/55 dark:bg-slate-900/45 border border-white/70 dark:border-white/10 backdrop-blur-md flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${stat.iconBg} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200 border border-white/30`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                  </div>

                  <div className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>+</span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                      {stat.value}
                    </span>
                    {stat.unit && (
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {stat.unit}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/50">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block truncate max-w-full ${stat.badgeColor}`}
                  >
                    {stat.subtext}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
