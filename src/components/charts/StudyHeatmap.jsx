import React, { useState, useMemo } from 'react';
import { 
  format, 
  subWeeks, 
  addDays, 
  startOfWeek, 
  startOfDay, 
  isSameDay, 
  isAfter 
} from 'date-fns';
import { useTaskStore } from '../../store/useTaskStore';
import { Flame, Trophy, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { calculateStreak, getGenuineLogHours } from '../../utils/studyStats';

export default function StudyHeatmap() {
  const { timerLogs, tasks } = useTaskStore();
  const [hoveredDay, setHoveredDay] = useState(null);
  const [timeframe, setTimeframe] = useState('16w'); // '16w' (4m) | '26w' (6m) | 'year' (52w)
  const [activityMode, setActivityMode] = useState('all'); // 'all' | 'hours' | 'tasks'

  const { currentStreak, bestStreak } = calculateStreak(timerLogs, tasks);

  const today = useMemo(() => startOfDay(new Date()), []);

  const numWeeks = timeframe === 'year' ? 52 : timeframe === '26w' ? 26 : 16;
  const currentWeekMonday = useMemo(() => startOfWeek(today, { weekStartsOn: 1 }), [today]);
  const startMonday = useMemo(() => subWeeks(currentWeekMonday, numWeeks - 1), [currentWeekMonday, numWeeks]);

  // Index logs by date
  const logMap = useMemo(() => {
    const map = {};
    if (Array.isArray(timerLogs)) {
      timerLogs.forEach((l) => {
        if (l && l.date) {
          map[l.date] = l;
        }
      });
    }
    return map;
  }, [timerLogs]);

  // Index tasks by date
  const taskMap = useMemo(() => {
    const map = {};
    if (Array.isArray(tasks)) {
      tasks.forEach((t) => {
        if (t && t.date) {
          if (!map[t.date]) map[t.date] = [];
          map[t.date].push(t);
        }
      });
    }
    return map;
  }, [tasks]);

  // Total genuine hours & completed tasks
  const { totalHours, totalTasksDone } = useMemo(() => {
    let hours = 0;
    let done = 0;

    if (Array.isArray(timerLogs)) {
      timerLogs.forEach((l) => {
        hours += getGenuineLogHours(l);
      });
    }

    if (Array.isArray(tasks)) {
      tasks.forEach((t) => {
        if (t && t.status === 'Done') done++;
      });
    }

    return {
      totalHours: Number(hours.toFixed(1)),
      totalTasksDone: done,
    };
  }, [timerLogs, tasks]);

  // Generate grid weeks structure: 7 rows x numWeeks columns
  const weeksData = useMemo(() => {
    const weeks = [];

    for (let w = 0; w < numWeeks; w++) {
      const weekMonday = addDays(startMonday, w * 7);
      const days = [];

      for (let r = 0; r < 7; r++) {
        const day = addDays(weekMonday, r);
        const dateStr = format(day, 'yyyy-MM-dd');
        const isCurrentDay = isSameDay(day, today);
        const isFutureDay = isAfter(day, today);

        const log = logMap[dateStr];
        const dayTasks = taskMap[dateStr] || [];
        const hours = log ? getGenuineLogHours(log) : 0;
        
        const tasksCompletedCount = dayTasks.filter((t) => t.status === 'Done').length + 
          (log?.tasksCompleted && dayTasks.length === 0 ? log.tasksCompleted : 0);
        const tasksPlannedCount = Math.max(dayTasks.length, tasksCompletedCount);

        // Subject breakdown
        const subjectsStudied = [];
        if (log && log.subjectBreakdown) {
          Object.entries(log.subjectBreakdown).forEach(([name, h]) => {
            if (Number(h) > 0) subjectsStudied.push({ name, hours: Number(h) });
          });
        }
        dayTasks.forEach((t) => {
          if (t.subject && !subjectsStudied.some((s) => s.name === t.subject)) {
            subjectsStudied.push({ name: t.subject, isTaskOnly: true });
          }
        });

        // Compute intensity 0-4 based on selected activity mode
        let intensity = 0;
        if (!isFutureDay) {
          if (activityMode === 'hours') {
            if (hours >= 6) intensity = 4;
            else if (hours >= 4) intensity = 3;
            else if (hours >= 2) intensity = 2;
            else if (hours > 0) intensity = 1;
          } else if (activityMode === 'tasks') {
            if (tasksCompletedCount >= 5) intensity = 4;
            else if (tasksCompletedCount >= 3) intensity = 3;
            else if (tasksCompletedCount >= 2) intensity = 2;
            else if (tasksCompletedCount >= 1) intensity = 1;
          } else {
            // 'all' combined
            if (hours >= 5 || tasksCompletedCount >= 4) intensity = 4;
            else if (hours >= 3 || tasksCompletedCount >= 3) intensity = 3;
            else if (hours >= 1.5 || tasksCompletedCount >= 2) intensity = 2;
            else if (hours > 0 || tasksCompletedCount >= 1 || log?.visited || isCurrentDay) intensity = 1;
          }
        }

        days.push({
          date: day,
          dateStr,
          isToday: isCurrentDay,
          isFuture: isFutureDay,
          hours,
          tasksCompleted: tasksCompletedCount,
          tasksPlanned: tasksPlannedCount,
          intensity,
          subjects: subjectsStudied,
          visited: log?.visited || isCurrentDay,
        });
      }

      // Check month label for this week
      const firstDay = days[0].date;
      const showMonthLabel = w === 0 || firstDay.getDate() <= 7;
      const monthLabel = showMonthLabel ? format(firstDay, 'MMM') : '';

      weeks.push({
        weekIndex: w,
        monthLabel,
        days,
      });
    }

    return weeks;
  }, [numWeeks, startMonday, today, logMap, taskMap, activityMode]);

  // Color classes for intensity cells
  const getCellClasses = (day) => {
    if (day.isFuture) {
      return 'bg-slate-100/50 dark:bg-slate-800/40 border border-dashed border-slate-300/40 dark:border-slate-700/40 cursor-default opacity-40';
    }

    const todayRing = day.isToday 
      ? 'ring-2 ring-teal-400 dark:ring-teal-300 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 z-10' 
      : '';

    switch (day.intensity) {
      case 4:
        return `bg-teal-700 dark:bg-teal-300 border border-teal-600 dark:border-teal-200 shadow-[0_0_8px_rgba(45,212,191,0.5)] ${todayRing}`;
      case 3:
        return `bg-teal-600 dark:bg-teal-400 border border-teal-500 dark:border-teal-300 ${todayRing}`;
      case 2:
        return `bg-teal-400 dark:bg-teal-600 border border-teal-400 dark:border-teal-500 ${todayRing}`;
      case 1:
        return `bg-teal-200 dark:bg-teal-900/70 border border-teal-300/70 dark:border-teal-800/60 ${todayRing}`;
      default:
        return `bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/50 dark:border-slate-700/50 ${todayRing}`;
    }
  };

  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

  return (
    <div className="clay-card p-4 sm:p-6 shadow-neu-card relative overflow-hidden">
      {/* Header with Title and Quick Filter Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">
              Study Consistency Heatmap
            </h3>
          </div>
        </div>

        {/* Action Controls: Mode & Timeframe Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode switch */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            {[
              { id: 'all', label: 'All Activity' },
              { id: 'hours', label: 'Study Hours' },
              { id: 'tasks', label: 'Tasks' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setActivityMode(m.id)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  activityMode === m.id
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm border border-slate-200/50 dark:border-white/10'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Timeframe switch */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            {[
              { id: '16w', label: '4 Months' },
              { id: '26w', label: '6 Months' },
              { id: 'year', label: 'Full Year' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  timeframe === tf.id
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm border border-slate-200/50 dark:border-white/10'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Badges Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Flame className="w-4 h-4 fill-current animate-pulse" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-amber-600/80 dark:text-amber-400/80">Current Streak</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
              {currentStreak} <span className="text-xs font-semibold text-slate-500">Days</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/25">
          <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-600 dark:text-violet-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-violet-600/80 dark:text-violet-400/80">Best Streak</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
              {bestStreak} <span className="text-xs font-semibold text-slate-500">Days</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/25">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-teal-600/80 dark:text-teal-400/80">Focus Logged</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
              {totalHours} <span className="text-xs font-semibold text-slate-500">Hours</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-emerald-600/80 dark:text-emerald-400/80">Tasks Done</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
              {totalTasksDone} <span className="text-xs font-semibold text-slate-500">Tasks</span>
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="relative overflow-x-auto pb-2 scrollbar-thin">
        <div className="inline-flex flex-col min-w-max py-2">
          {/* Month labels header */}
          <div className="flex pl-8 sm:pl-9 mb-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {weeksData.map((week, idx) => (
              <div 
                key={idx} 
                className="w-4 sm:w-4.5 mx-0.5 text-left truncate overflow-visible"
              >
                {week.monthLabel}
              </div>
            ))}
          </div>

          {/* Grid rows with Day labels on left */}
          <div className="flex items-start">
            {/* Weekday indicators */}
            <div className="flex flex-col justify-between pr-2 text-[10px] font-bold text-slate-400 select-none h-[116px] sm:h-[126px]">
              {dayLabels.map((label, idx) => (
                <div key={idx} className="h-3 sm:h-3.5 flex items-center">
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-1 sm:gap-1.5">
              {weeksData.map((week) => (
                <div key={week.weekIndex} className="flex flex-col gap-1 sm:gap-1.5">
                  {week.days.map((day) => (
                    <div
                      key={day.dateStr}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm sm:rounded-md transition-all duration-150 transform hover:scale-135 hover:shadow-md cursor-pointer ${getCellClasses(
                        day
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Card on Hover */}
      {hoveredDay && (
        <div className="mt-3 p-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-4 transition-all animate-in fade-in duration-100">
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3">
              <span className={`w-3.5 h-3.5 rounded-md shrink-0 ${getCellClasses(hoveredDay)}`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white">
                    {format(hoveredDay.date, 'EEEE, MMMM d, yyyy')}
                  </span>
                  {hoveredDay.isToday && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                      Today
                    </span>
                  )}
                  {hoveredDay.isFuture && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                      Upcoming
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>
                    Logged: <strong className="text-slate-800 dark:text-white">{hoveredDay.hours} hrs</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Tasks: <strong className="text-slate-800 dark:text-white">{hoveredDay.tasksCompleted}</strong> completed
                    {hoveredDay.tasksPlanned > 0 && ` of ${hoveredDay.tasksPlanned} planned`}
                  </span>
                </div>
              </div>
            </div>

            {/* Subjects studied chips */}
            {hoveredDay.subjects && hoveredDay.subjects.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
                {hoveredDay.subjects.map((s, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 border border-slate-200 dark:border-slate-600 shadow-sm"
                  >
                    {s.name} {s.hours ? `(${s.hours}h)` : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 font-semibold pt-3 mt-3 border-t border-slate-200/50 dark:border-slate-700/50 gap-2">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <span>Less Activity</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-sm bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/50 dark:border-slate-700/50" />
            <div className="w-3.5 h-3.5 rounded-sm bg-teal-200 dark:bg-teal-900/70 border border-teal-300/70 dark:border-teal-800/60" />
            <div className="w-3.5 h-3.5 rounded-sm bg-teal-400 dark:bg-teal-600 border border-teal-400 dark:border-teal-500" />
            <div className="w-3.5 h-3.5 rounded-sm bg-teal-600 dark:bg-teal-400 border border-teal-500 dark:border-teal-300" />
            <div className="w-3.5 h-3.5 rounded-sm bg-teal-700 dark:bg-teal-300 border border-teal-600 dark:border-teal-200 shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
          </div>
          <span>Deep Focus (5h+ or 4+ Tasks)</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full ring-2 ring-teal-400 ring-offset-1 ring-offset-white dark:ring-offset-slate-900" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm border border-dashed border-slate-400 opacity-60" />
            <span>Upcoming</span>
          </div>
        </div>
      </div>
    </div>
  );
}
