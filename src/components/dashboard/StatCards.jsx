import React from 'react';
import { CheckCircle2, Clock, Flame, ListTodo, TrendingUp } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { calculateStreak, calculateStudyHours } from '../../utils/studyStats';

export default function StatCards() {
  const { tasks, timerLogs } = useTaskStore();

  // Completed tasks count
  const completedTasks = tasks.filter((t) => t.status === 'Done');
  const pendingTasks = tasks.filter((t) => t.status !== 'Done');

  // Compute dynamic study hours
  const { thisWeekHours, weeklyDelta } = calculateStudyHours(timerLogs);

  // Compute dynamic streak
  const { currentStreak, studiedToday } = calculateStreak(timerLogs, tasks);

  const stats = [
    {
      id: 'tasks-completed',
      title: 'Tasks Completed',
      value: `${completedTasks.length}`,
      subtext: `${completedTasks.length > 0 ? `${completedTasks.length} done` : 'No tasks done yet'}`,
      icon: CheckCircle2,
      iconBg: 'bg-[#5FB3B3]',
      iconColor: 'text-white',
      badgeColor: 'text-teal-700 dark:text-teal-300 bg-teal-100/60 dark:bg-teal-950/40',
    },
    {
      id: 'study-hours',
      title: 'Study Hours',
      value: `${thisWeekHours}`,
      unit: 'hrs',
      subtext: `${weeklyDelta >= 0 ? '+' : ''}${weeklyDelta}h vs last week`,
      icon: Clock,
      iconBg: 'bg-[#6A9AC4]',
      iconColor: 'text-white',
      badgeColor: 'text-blue-700 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-950/40',
    },
    {
      id: 'streak',
      title: 'Current Streak',
      value: `${currentStreak}`,
      unit: currentStreak === 1 ? 'day' : 'days',
      subtext: studiedToday ? 'Active today 🔥' : currentStreak > 0 ? 'Study to keep 🔥' : 'Start streak today',
      icon: Flame,
      iconBg: 'bg-[#7B7FBF]',
      iconColor: 'text-white',
      badgeColor: 'text-purple-700 dark:text-purple-300 bg-purple-100/60 dark:bg-purple-950/40',
    },
    {
      id: 'pending-tasks',
      title: 'Pending Tasks',
      value: `${pendingTasks.length}`,
      subtext: pendingTasks.length === 1 ? '1 task left' : `${pendingTasks.length} tasks left`,
      icon: ListTodo,
      iconBg: 'bg-[#52A5B5]',
      iconColor: 'text-white',
      badgeColor: 'text-cyan-700 dark:text-cyan-300 bg-cyan-100/60 dark:bg-cyan-950/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="clay-card p-3 sm:p-5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
          >
            {/* Top Icon Squircle */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 border border-white/30`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 fill-current/20 stroke-[2.2]" />
              </div>

              <div className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span>+</span>
              </div>
            </div>

            {/* Stat Title */}
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                {stat.title}
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500">{stat.unit}</span>
                )}
              </div>
            </div>

            {/* Bottom Change Subtext */}
            <div className="mt-2 sm:mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md inline-block truncate max-w-full ${stat.badgeColor}`}>
                {stat.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
