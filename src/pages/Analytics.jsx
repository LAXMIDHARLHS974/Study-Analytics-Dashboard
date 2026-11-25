import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  CheckSquare,
  Flame,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Target,
  Sparkles,
  CheckCircle2,
  Loader2,
  XCircle,
  CalendarDays,
  BarChart3,
  Users,
} from 'lucide-react';
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isAfter,
  startOfDay,
  addMonths,
  parseISO,
} from 'date-fns';
import { useTaskStore } from '../store/useTaskStore';
import {
  calculateStreak,
  getGenuineLogHours,
} from '../utils/studyStats';

const SUBJECT_PALETTE = ['#8B5CF6', '#3B82F6', '#38BDF8', '#FBBF24', '#EC4899', '#A855F7', '#10B981'];
const PERIOD_DAYS = 30;

const formatHoursMinutes = (decimalHours) => {
  const totalMinutes = Math.round((Number(decimalHours) || 0) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
};

function TrendTooltip({ active, payload, metric }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900/95 text-white px-3 py-2 rounded-xl shadow-2xl border border-violet-500/30 text-xs backdrop-blur-xl">
      <p className="text-[11px] font-semibold text-slate-300">{d.fullDate}</p>
      <p className="text-sm font-extrabold text-white mt-0.5">
        {metric === 'hours' ? formatHoursMinutes(d.hours) : `${d.tasksDone} tasks`}
      </p>
    </div>
  );
}

function SubjectTooltip({ active, payload, mode }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-slate-900/95 text-white px-3 py-2 rounded-xl shadow-2xl border border-white/15 text-xs backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
        <span className="font-bold">{item.name}</span>
      </div>
      <p className="text-slate-300 font-semibold">
        {mode === 'percent' ? `${item.pct}% (${item.hours}h)` : `${item.hours}h (${item.pct}%)`}
      </p>
    </div>
  );
}

export default function Analytics() {
  const { tasks, subjects, timerLogs } = useTaskStore();

  const [trendMetric, setTrendMetric] = useState('hours'); // 'hours' | 'tasks'
  const [subjectUnit, setSubjectUnit] = useState('hours'); // 'percent' | 'hours'
  const [heatmapMonth, setHeatmapMonth] = useState(() => new Date());

  const today = useMemo(() => startOfDay(new Date()), []);

  // Index logs by date for fast lookup
  const logMap = useMemo(() => {
    const map = {};
    (timerLogs || []).forEach((l) => {
      if (l && l.date) map[l.date] = l;
    });
    return map;
  }, [timerLogs]);

  // Period metrics & trend series (last 30 days)
  const analyticsData = useMemo(() => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeSubjects = Array.isArray(subjects) ? subjects : [];
    const safeLogs = Array.isArray(timerLogs) ? timerLogs : [];

    const periodStart = subDays(today, PERIOD_DAYS - 1);
    const prevStart = subDays(today, PERIOD_DAYS * 2 - 1);
    const prevEnd = subDays(today, PERIOD_DAYS);

    const inCurrentPeriod = (dateStr) => {
      if (!dateStr) return false;
      try {
        const d = startOfDay(parseISO(dateStr));
        return d >= periodStart && d <= today;
      } catch {
        return false;
      }
    };

    const inPrevPeriod = (dateStr) => {
      if (!dateStr) return false;
      try {
        const d = startOfDay(parseISO(dateStr));
        return d >= prevStart && d <= prevEnd;
      } catch {
        return false;
      }
    };

    let currentHours = 0;
    let prevHours = 0;
    let activeDaysCur = 0;

    // Canonical subject map from existing subjects only (deleted subjects excluded)
    const canonicalSubjects = new Map();
    safeSubjects.forEach((s, idx) => {
      if (!s || !s.name) return;
      const cleanName = s.name.trim();
      const lower = cleanName.toLowerCase();
      if (!canonicalSubjects.has(lower)) {
        canonicalSubjects.set(lower, {
          id: s.id,
          name: cleanName,
          color: s.color || SUBJECT_PALETTE[idx % SUBJECT_PALETTE.length],
          hours: 0,
        });
      }
    });

    safeLogs.forEach((log) => {
      if (!log || !log.date) return;
      const hrs = getGenuineLogHours(log);
      if (inCurrentPeriod(log.date)) {
        currentHours += hrs;
        if (hrs > 0 || log.tasksCompleted > 0 || log.visited) activeDaysCur++;
        if (log.subjectBreakdown && typeof log.subjectBreakdown === 'object') {
          Object.entries(log.subjectBreakdown).forEach(([name, h]) => {
            const key = (name || '').trim().toLowerCase();
            if (canonicalSubjects.has(key)) {
              canonicalSubjects.get(key).hours += Number(h) || 0;
            }
          });
        }
      } else if (inPrevPeriod(log.date)) {
        prevHours += hrs;
      }
    });

    currentHours = Number(currentHours.toFixed(1));
    prevHours = Number(prevHours.toFixed(1));

    const hoursDeltaPct =
      prevHours > 0
        ? Number((((currentHours - prevHours) / prevHours) * 100).toFixed(1))
        : null;

    // Task stats in period
    const periodTasks = safeTasks.filter((t) => inCurrentPeriod(t.date));
    const doneTasks = periodTasks.filter((t) => t.status === 'Done').length;
    const inProgressTasks = periodTasks.filter((t) => t.status === 'In Progress').length;
    const pendingTasks = Math.max(0, periodTasks.length - doneTasks - inProgressTasks);
    const totalTasks = periodTasks.length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Streak & consistency stats
    const { currentStreak, bestStreak } = calculateStreak(safeLogs, safeTasks);
    const focusRate = Math.min(100, Math.round((activeDaysCur / PERIOD_DAYS) * 100));

    // Build daily series for Study Time Trend
    const trendSeries = [];
    for (let i = PERIOD_DAYS - 1; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const log = logMap[dateStr];
      const dayTasksDone = safeTasks.filter(
        (t) => t.date === dateStr && t.status === 'Done'
      ).length;
      const tasksDone = Math.max(dayTasksDone, Number(log?.tasksCompleted) || 0);
      const hours = log ? getGenuineLogHours(log) : 0;
      trendSeries.push({
        label: format(d, 'MMM d'),
        fullDate: format(d, 'MMM d, yyyy'),
        hours,
        tasksDone,
      });
    }

    // Subject breakdown list
    const subjectItemsRaw = Array.from(canonicalSubjects.values()).map((item) => ({
      ...item,
      hours: Number(item.hours.toFixed(1)),
    }));
    const subjectTotalHours = Number(
      subjectItemsRaw.reduce((sum, s) => sum + s.hours, 0).toFixed(1)
    );
    const subjectItems = subjectItemsRaw
      .map((item) => ({
        ...item,
        pct: subjectTotalHours > 0 ? Math.round((item.hours / subjectTotalHours) * 100) : 0,
      }))
      .sort((a, b) => b.hours - a.hours);

    return {
      currentHours,
      hoursDeltaPct,
      doneTasks,
      inProgressTasks,
      pendingTasks,
      totalTasks,
      completionRate,
      currentStreak,
      bestStreak,
      focusRate,
      trendSeries,
      subjectItems,
      subjectTotalHours,
    };
  }, [tasks, subjects, timerLogs, today, logMap]);

  // Monthly Consistency Heatmap + Weekday insights
  const monthHeatmap = useMemo(() => {
    const mStart = startOfMonth(heatmapMonth);
    const mEnd = endOfMonth(heatmapMonth);
    const gridStart = startOfWeek(mStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(mEnd, { weekStartsOn: 1 });
    const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    const weekdayCounts = Array.from({ length: 7 }, () => ({ active: 0, total: 0 }));
    let monthHoursSum = 0;
    let monthActiveDays = 0;

    eachDayOfInterval({ start: mStart, end: mEnd }).forEach((day) => {
      if (isAfter(day, today)) return;
      const dateStr = format(day, 'yyyy-MM-dd');
      const log = logMap[dateStr];
      const hrs = log ? getGenuineLogHours(log) : 0;
      const hasTaskDone = (tasks || []).some((t) => t.date === dateStr && t.status === 'Done');
      const isActive = hrs > 0 || hasTaskDone || Boolean(log?.visited);

      const wd = (day.getDay() + 6) % 7;
      weekdayCounts[wd].total++;
      if (isActive) {
        weekdayCounts[wd].active++;
        monthActiveDays++;
      }
      monthHoursSum += hrs;
    });

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let bestDayLabel = '—';
    let bestDayPct = 0;
    weekdayCounts.forEach((entry, idx) => {
      if (entry.total > 0) {
        const pct = Math.round((entry.active / entry.total) * 100);
        if (pct > bestDayPct) {
          bestDayPct = pct;
          bestDayLabel = dayNames[idx];
        }
      }
    });

    const avgDailyHours = monthActiveDays > 0 ? monthHoursSum / monthActiveDays : 0;

    return {
      weeks,
      mStart,
      bestDayText: bestDayPct > 0 ? `${bestDayLabel} (${bestDayPct}%)` : 'No data yet',
      avgDailyText: formatHoursMinutes(avgDailyHours),
    };
  }, [heatmapMonth, logMap, tasks, today]);

  const getHeatCellClass = (day) => {
    const inMonth = isSameMonth(day, monthHeatmap.mStart);
    if (!inMonth) {
      return 'opacity-20 bg-slate-200/50 dark:bg-slate-800/40 border border-transparent';
    }
    if (isAfter(day, today)) {
      return 'bg-slate-200/50 dark:bg-slate-800/40 border border-slate-300/30 dark:border-white/5 opacity-50';
    }
    const dateStr = format(day, 'yyyy-MM-dd');
    const log = logMap[dateStr];
    const hrs = log ? getGenuineLogHours(log) : 0;
    const tasksDone = (tasks || []).filter((t) => t.date === dateStr && t.status === 'Done').length;

    if (hrs >= 5 || tasksDone >= 4) {
      return 'bg-purple-500 dark:bg-purple-400 border border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.45)]';
    }
    if (hrs >= 3 || tasksDone >= 3) {
      return 'bg-purple-400 dark:bg-purple-500 border border-purple-400/60';
    }
    if (hrs >= 1.5 || tasksDone >= 2) {
      return 'bg-violet-400/80 dark:bg-violet-600/80 border border-violet-400/40';
    }
    if (hrs > 0 || tasksDone >= 1 || log?.visited) {
      return 'bg-violet-300/70 dark:bg-violet-800/70 border border-violet-300/40 dark:border-violet-700/50';
    }
    return 'bg-slate-200/80 dark:bg-slate-800/70 border border-slate-300/40 dark:border-white/5';
  };

  const activeSubjectSlices = analyticsData.subjectItems.filter((s) => s.hours > 0);
  const subjectPieData =
    analyticsData.subjectTotalHours > 0
      ? activeSubjectSlices
      : analyticsData.subjectItems.map((s) => ({ ...s, chartValue: 1 }));

  const taskRingData =
    analyticsData.totalTasks > 0
      ? [
          { name: 'Completed', value: analyticsData.doneTasks, color: '#A855F7' },
          { name: 'In Progress', value: analyticsData.inProgressTasks, color: '#F59E0B' },
          { name: 'Pending', value: analyticsData.pendingTasks, color: '#64748B' },
        ].filter((d) => d.value > 0)
      : [{ name: 'No Tasks', value: 1, color: '#475569' }];

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300 pb-6">
      {/* 1. Top Row: Study Consistency Heatmap & Study Time Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Study Consistency Heatmap */}
        <div className="clay-card p-4 sm:p-5 flex flex-col justify-between lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-500/25">
                <CalendarDays className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
                Study Consistency Heatmap
              </h3>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl neu-inset text-xs font-bold text-slate-700 dark:text-slate-200">
              <button
                type="button"
                onClick={() => setHeatmapMonth((m) => addMonths(m, -1))}
                className="p-1 rounded-md hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="min-w-[74px] text-center">
                {format(heatmapMonth, 'MMM yyyy')}
              </span>
              <button
                type="button"
                onClick={() => setHeatmapMonth((m) => addMonths(m, 1))}
                className="p-1 rounded-md hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Calendar Matrix */}
            <div className="sm:col-span-7 space-y-2.5 overflow-x-auto">
              <div className="flex items-start gap-2">
                <div className="grid grid-rows-7 gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 pt-0.5 shrink-0">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                    <span key={d} className="h-5 sm:h-6 flex items-center">
                      {d}
                    </span>
                  ))}
                </div>

                <div
                  className="grid gap-1.5 flex-1"
                  style={{
                    gridTemplateColumns: `repeat(${monthHeatmap.weeks.length}, minmax(18px, 1fr))`,
                  }}
                >
                  {monthHeatmap.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="grid grid-rows-7 gap-1.5">
                      {week.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const log = logMap[dateStr];
                        const hrs = log ? getGenuineLogHours(log) : 0;
                        return (
                          <div
                            key={dateStr}
                            title={`${format(day, 'MMM d, yyyy')} • ${hrs}h studied`}
                            className={`h-5 sm:h-6 rounded-md transition-transform hover:scale-110 ${getHeatCellClass(
                              day
                            )}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                <span>Less Activity</span>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-slate-200/80 dark:bg-slate-800/70 border border-slate-300/40 dark:border-white/5" />
                  <span className="w-3 h-3 rounded-sm bg-violet-300/70 dark:bg-violet-800/70" />
                  <span className="w-3 h-3 rounded-sm bg-violet-400/80 dark:bg-violet-600/80" />
                  <span className="w-3 h-3 rounded-sm bg-purple-500 dark:bg-purple-400" />
                </div>
                <span>More Activity (5h+)</span>
              </div>
            </div>

            {/* 3 Right Mini Stats */}
            <div className="sm:col-span-5 space-y-2.5">
              <div className="p-2.5 rounded-xl neu-inset flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-500 dark:text-sky-300 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Most Consistent Day
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white truncate block">
                    {monthHeatmap.bestDayText}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl neu-inset flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Longest Streak
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white">
                    {analyticsData.bestStreak}{' '}
                    {analyticsData.bestStreak === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl neu-inset flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-500 dark:text-violet-300 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Avg. Daily Study
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white">
                    {monthHeatmap.avgDailyText}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Study Time Trend AreaChart */}
        <div className="clay-card p-4 sm:p-5 flex flex-col justify-between lg:col-span-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-500/25">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
                Study Time Trend
              </h3>
            </div>

            <select
              value={trendMetric}
              onChange={(e) => setTrendMetric(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl neu-inset text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="hours" className="bg-slate-800 text-white">
                Study Hours
              </option>
              <option value="tasks" className="bg-slate-800 text-white">
                Tasks Done
              </option>
            </select>
          </div>

          <div className="h-52 sm:h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analyticsData.trendSeries}
                margin={{ top: 12, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="studyTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.14)" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={24}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={trendMetric === 'hours'}
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  tickFormatter={(v) => (trendMetric === 'hours' ? `${v}h` : v)}
                  domain={[0, (dataMax) => Math.max(4, Math.ceil(dataMax * 1.25))]}
                />
                <Tooltip content={<TrendTooltip metric={trendMetric} />} />
                <Area
                  type="monotone"
                  dataKey={trendMetric === 'hours' ? 'hours' : 'tasksDone'}
                  stroke="#A855F7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#studyTrendGrad)"
                  dot={{ r: 3, fill: '#E9D5FF', stroke: '#A855F7', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: '#FFFFFF', stroke: '#A855F7', strokeWidth: 2.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. Bottom Row: Subject Wise Study Time, Task Completion, Study Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Subject Wise Study Time */}
        <div className="clay-card p-4 sm:p-5 flex flex-col justify-between lg:col-span-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-500/25">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
                Subject Wise Study Time
              </h3>
            </div>

            <div className="flex items-center p-0.5 rounded-xl neu-inset text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setSubjectUnit('percent')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  subjectUnit === 'percent'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                %
              </button>
              <button
                type="button"
                onClick={() => setSubjectUnit('hours')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  subjectUnit === 'hours'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Hours
              </button>
            </div>
          </div>

          {analyticsData.subjectItems.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
              <div className="w-40 h-40 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<SubjectTooltip mode={subjectUnit} />} />
                    <Pie
                      data={subjectPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={68}
                      paddingAngle={subjectPieData.length > 1 ? 3 : 0}
                      dataKey={analyticsData.subjectTotalHours > 0 ? 'hours' : 'chartValue'}
                      stroke="none"
                    >
                      {subjectPieData.map((entry, idx) => (
                        <Cell
                          key={`${entry.name}-${idx}`}
                          fill={entry.color}
                          opacity={analyticsData.subjectTotalHours > 0 ? 1 : 0.6}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                    {analyticsData.subjectTotalHours} h
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Total
                  </span>
                </div>
              </div>

              <div className="w-full flex-1 space-y-2 max-h-44 overflow-y-auto pr-1">
                {analyticsData.subjectItems.map((item) => (
                  <div
                    key={item.id || item.name}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-200/40 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="font-bold text-slate-800 dark:text-white tabular-nums">
                        {item.hours} h
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 min-w-[30px] text-right tabular-nums">
                        {item.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No subjects added yet. Add subjects in the Subjects page to see breakdown.
            </div>
          )}
        </div>

        {/* Task Completion */}
        <div className="clay-card p-4 sm:p-5 flex flex-col justify-between lg:col-span-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-500/25">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
              Task Completion
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
            <div className="w-36 h-36 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskRingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={62}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={taskRingData.length > 1 ? 3 : 0}
                    dataKey="value"
                    stroke="none"
                  >
                    {taskRingData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                  {analyticsData.completionRate}%
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {analyticsData.doneTasks} / {analyticsData.totalTasks}
                </span>
              </div>
            </div>

            <div className="w-full flex-1 space-y-2">
              <div className="p-2.5 rounded-xl neu-inset flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Completed
                </span>
                <span className="font-extrabold text-slate-800 dark:text-white">
                  {analyticsData.doneTasks}
                </span>
              </div>

              <div className="p-2.5 rounded-xl neu-inset flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                  <Loader2 className="w-4 h-4 text-amber-500" />
                  In Progress
                </span>
                <span className="font-extrabold text-slate-800 dark:text-white">
                  {analyticsData.inProgressTasks}
                </span>
              </div>

              <div className="p-2.5 rounded-xl neu-inset flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  Pending
                </span>
                <span className="font-extrabold text-slate-800 dark:text-white">
                  {analyticsData.pendingTasks}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Study Insights */}
        <div className="clay-card p-4 sm:p-5 flex flex-col justify-between lg:col-span-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-500/25">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
              Study Insights
            </h3>
          </div>

          <div className="space-y-2.5 flex-1 flex flex-col justify-center">
            <div className="p-2.5 rounded-xl neu-inset flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0 text-xs">
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 mr-1.5">
                  {analyticsData.hoursDeltaPct !== null
                    ? `${analyticsData.hoursDeltaPct >= 0 ? '+' : ''}${analyticsData.hoursDeltaPct}%`
                    : `${analyticsData.currentHours}h`}
                </span>
                <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                  {analyticsData.hoursDeltaPct !== null
                    ? 'Study time vs previous 30 days.'
                    : 'Total study time logged in last 30 days.'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl neu-inset flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0 text-xs">
                <span className="font-extrabold text-amber-600 dark:text-amber-400 mr-1.5">
                  {analyticsData.currentStreak} Days
                </span>
                <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                  {analyticsData.currentStreak > 0
                    ? 'You are on an active study streak! Keep it up!'
                    : 'Complete a task today to start your streak!'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl neu-inset flex items-center gap-2.5">
              <Target className="w-4 h-4 text-sky-500 shrink-0" />
              <div className="min-w-0 text-xs">
                <span className="font-extrabold text-sky-600 dark:text-sky-400 mr-1.5">
                  {analyticsData.focusRate}%
                </span>
                <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                  {analyticsData.focusRate >= 75
                    ? 'Your consistency rate is excellent.'
                    : 'Steady daily sessions will boost your focus rate.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
