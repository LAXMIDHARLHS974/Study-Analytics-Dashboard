import { 
  format, 
  subDays, 
  addDays, 
  subWeeks,
  subMonths,
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  differenceInCalendarDays, 
  parseISO 
} from 'date-fns';

// Fake demo subjects to be strictly filtered out
export const FAKE_SUBJECT_NAMES = new Set([
  'mathematics',
  'physics',
  'computer science',
  'computer sci',
  'chemistry',
]);

/**
 * Extracts only genuine study hours from a log (excluding fake demo subjects)
 */
export const getGenuineLogHours = (log) => {
  if (!log) return 0;
  if (log.subjectBreakdown && typeof log.subjectBreakdown === 'object') {
    let genuineSum = 0;
    let hasEntries = false;
    Object.entries(log.subjectBreakdown).forEach(([name, hours]) => {
      hasEntries = true;
      if (!FAKE_SUBJECT_NAMES.has(name.trim().toLowerCase())) {
        genuineSum += Number(hours) || 0;
      }
    });
    if (hasEntries) {
      return Number(genuineSum.toFixed(2));
    }
  }
  return Number(log.hours) || 0;
};

/**
 * Calculates accurate current streak, best streak, and study status.
 * Visiting the website every day increments the streak (daily visit streak),
 * in addition to completing tasks or studying via timer.
 */
export const calculateStreak = (timerLogs = [], tasks = []) => {
  const activeDateSet = new Set();

  if (Array.isArray(timerLogs)) {
    timerLogs.forEach((log) => {
      // Day is active if user visited the website, logged genuine hours, or completed tasks
      const genuineHours = getGenuineLogHours(log);
      if (
        log.visited ||
        genuineHours > 0 ||
        (log.tasksCompleted && Number(log.tasksCompleted) > 0)
      ) {
        if (log.date) activeDateSet.add(log.date);
      }
    });
  }

  if (Array.isArray(tasks)) {
    tasks.forEach((task) => {
      if (task.status === 'Done') {
        if (task.completedAt) {
          try {
            activeDateSet.add(format(parseISO(task.completedAt), 'yyyy-MM-dd'));
          } catch {
            // fallback if parse fails
          }
        } else if (task.date) {
          activeDateSet.add(task.date);
        }
      }
    });
  }

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

  const studiedToday = activeDateSet.has(todayStr);
  const studiedYesterday = activeDateSet.has(yesterdayStr);

  // Compute current streak
  let currentStreak = 0;
  if (studiedToday) {
    let checkDate = today;
    while (activeDateSet.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }
  } else if (studiedYesterday) {
    let checkDate = subDays(today, 1);
    while (activeDateSet.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }
  }

  // Compute best streak across all historical dates
  const sortedDates = Array.from(activeDateSet).sort();
  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  for (const dateStr of sortedDates) {
    try {
      const curDate = parseISO(dateStr);
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diff = differenceInCalendarDays(curDate, prevDate);
        if (diff === 1) {
          tempStreak++;
        } else if (diff === 0) {
          // duplicate / same date
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
      prevDate = curDate;
    } catch {
      // skip invalid dates
    }
  }

  bestStreak = Math.max(bestStreak, currentStreak);

  return {
    currentStreak,
    bestStreak,
    studiedToday,
    studiedYesterday,
    totalActiveDays: activeDateSet.size,
  };
};

/**
 * Calculates total study hours this week, last week, today, and all-time,
 * strictly counting genuine study time.
 */
export const calculateStudyHours = (timerLogs = []) => {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const startThisWeek = startOfWeek(today, { weekStartsOn: 1 });
  const endThisWeek = endOfWeek(today, { weekStartsOn: 1 });
  const startLastWeek = startOfWeek(subDays(startThisWeek, 1), { weekStartsOn: 1 });
  const endLastWeek = endOfWeek(subDays(startThisWeek, 1), { weekStartsOn: 1 });

  let thisWeekHours = 0;
  let lastWeekHours = 0;
  let todayHours = 0;
  let totalHours = 0;

  if (Array.isArray(timerLogs)) {
    timerLogs.forEach((log) => {
      const hrs = getGenuineLogHours(log);
      totalHours += hrs;

      if (log.date === todayStr) {
        todayHours += hrs;
      }

      if (log.date) {
        try {
          const logDate = parseISO(log.date);
          if (logDate >= startThisWeek && logDate <= endThisWeek) {
            thisWeekHours += hrs;
          } else if (logDate >= startLastWeek && logDate <= endLastWeek) {
            lastWeekHours += hrs;
          }
        } catch {
          // ignore invalid date
        }
      }
    });
  }

  const weeklyDelta = Number((thisWeekHours - lastWeekHours).toFixed(1));

  return {
    thisWeekHours: Number(thisWeekHours.toFixed(1)),
    lastWeekHours: Number(lastWeekHours.toFixed(1)),
    todayHours: Number(todayHours.toFixed(1)),
    totalHours: Number(totalHours.toFixed(1)),
    weeklyDelta,
  };
};

/**
 * Generates daily breakdown for the Weekly Study Overview bar chart
 * for 'This Week' or 'Last Week', using genuine study hours only.
 */
export const calculateWeeklyBarData = (timerLogs = [], timeRange = 'This Week') => {
  const today = new Date();
  const currentWeekMonday = startOfWeek(today, { weekStartsOn: 1 });
  const targetMonday = timeRange === 'Last Week'
    ? startOfWeek(subDays(currentWeekMonday, 1), { weekStartsOn: 1 })
    : currentWeekMonday;

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const logMap = {};
  if (Array.isArray(timerLogs)) {
    timerLogs.forEach((l) => {
      if (l.date) logMap[l.date] = l;
    });
  }

  return dayNames.map((name, index) => {
    const dayDate = addDays(targetMonday, index);
    const dateStr = format(dayDate, 'yyyy-MM-dd');
    const log = logMap[dateStr];
    const hours = log ? getGenuineLogHours(log) : 0;
    const isToday = dateStr === format(today, 'yyyy-MM-dd');

    return {
      day: name,
      date: dateStr,
      displayHours: hours,
      hours,
      target: index < 5 ? 5.0 : 6.0,
      tasksCompleted: log?.tasksCompleted || 0,
      isToday,
    };
  });
};

/**
 * Calculates dynamic subject distribution by study time (hours) and subject
 * across selected time ranges ('all', 'month', 'week', 'today').
 * Strictly ignores fake demo subjects and includes user's genuine subjects (DSA, English, Backend, etc.).
 */
export const calculateSubjectDistribution = (timerLogs = [], subjects = [], timeFilter = 'all') => {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const startThisWeek = startOfWeek(today, { weekStartsOn: 1 });
  const startThisMonth = startOfMonth(today);

  const safeLogs = Array.isArray(timerLogs) ? timerLogs : [];
  const safeSubjects = Array.isArray(subjects) ? subjects : [];

  // Filter out any fake demo subjects from the subject list
  const genuineSubjects = safeSubjects.filter(
    (s) => s && s.name && !FAKE_SUBJECT_NAMES.has(s.name.trim().toLowerCase())
  );

  // Filter logs by selected timeframe
  const filteredLogs = safeLogs.filter((log) => {
    if (!log.date) return false;
    if (timeFilter === 'today') {
      return log.date === todayStr;
    }
    try {
      const d = parseISO(log.date);
      if (timeFilter === 'week') {
        return d >= startThisWeek;
      }
      if (timeFilter === 'month') {
        return d >= startThisMonth;
      }
    } catch {
      return false;
    }
    return true; // 'all'
  });

  // Aggregate genuine hours by subject name
  const subjectHoursMap = {};

  filteredLogs.forEach((log) => {
    if (log.subjectBreakdown && typeof log.subjectBreakdown === 'object') {
      Object.entries(log.subjectBreakdown).forEach(([name, hours]) => {
        if (!FAKE_SUBJECT_NAMES.has(name.trim().toLowerCase())) {
          const h = Number(hours) || 0;
          subjectHoursMap[name] = (subjectHoursMap[name] || 0) + h;
        }
      });
    }
  });

  // Map metadata (colors, codes) from store subjects
  const defaultColors = ['#7B7FBF', '#4EBA88', '#52A5B5', '#F6B26B', '#5FB3B3', '#E57373', '#BA68C8'];
  const subjectMetaMap = {};
  let colorIdx = 0;

  genuineSubjects.forEach((s) => {
    subjectMetaMap[s.name] = {
      color: s.color || defaultColors[colorIdx++ % defaultColors.length],
      code: s.code || (s.name ? s.name.substring(0, 4).toUpperCase() : 'SUBJ'),
      id: s.id,
      targetHoursWeekly: s.targetHoursWeekly || 6,
    };
  });

  // Merge registered subjects and any subjects with logged hours (excluding fake subjects)
  const allSubjectNames = Array.from(new Set([
    ...genuineSubjects.map((s) => s.name),
    ...Object.keys(subjectHoursMap),
  ])).filter((name) => Boolean(name) && !FAKE_SUBJECT_NAMES.has(name.trim().toLowerCase()));

  let totalHours = 0;
  allSubjectNames.forEach((name) => {
    totalHours += subjectHoursMap[name] || 0;
  });
  totalHours = Number(totalHours.toFixed(1));

  const items = allSubjectNames.map((name) => {
    const hours = Number((subjectHoursMap[name] || 0).toFixed(1));
    const percentage = totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0;
    const meta = subjectMetaMap[name] || {
      color: defaultColors[colorIdx++ % defaultColors.length],
      code: name.substring(0, 4).toUpperCase(),
      id: `subj-${name.toLowerCase().replace(/\s+/g, '-')}`,
    };

    return {
      name,
      hours,
      value: percentage,
      color: meta.color,
      code: meta.code,
    };
  });

  // Sort descending by study hours
  items.sort((a, b) => b.hours - a.hours);

  const activeItems = items.filter((item) => item.hours > 0);

  return {
    distribution: items,
    activeDistribution: activeItems.length > 0 ? activeItems : items,
    totalHours,
    activeCount: activeItems.length,
  };
};

/**
 * Calculates genuine dynamic trend data for Task Completion Trend
 * Supports 'weekly' (past 8 weeks), 'daily' (past 14 days), 'monthly' (past 6 months)
 */
export const calculateTaskCompletionTrend = (tasks = [], timerLogs = [], viewMode = 'weekly') => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeLogs = Array.isArray(timerLogs) ? timerLogs : [];
  const today = new Date();

  // Map timer logs by date for genuine hours and task counts
  const logMap = {};
  safeLogs.forEach((l) => {
    if (l && l.date) {
      logMap[l.date] = l;
    }
  });

  if (viewMode === 'daily') {
    // Past 14 days
    const days = [];
    let sumPlanned = 0;
    let sumCompleted = 0;

    for (let i = 13; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayLabel = format(d, 'd MMM'); // e.g. "21 Oct"
      
      const dayTasks = safeTasks.filter((t) => t && t.date === dateStr);
      const tasksDoneCount = dayTasks.filter((t) => t.status === 'Done').length;
      const log = logMap[dateStr];
      const logDone = (log?.tasksCompleted && dayTasks.length === 0) ? log.tasksCompleted : 0;
      const completed = tasksDoneCount + logDone;
      const planned = Math.max(dayTasks.length, completed);

      sumPlanned += planned;
      sumCompleted += completed;

      const rate = planned > 0 ? Math.round((completed / planned) * 100) : (completed > 0 ? 100 : 0);
      const hours = log ? getGenuineLogHours(log) : 0;

      days.push({
        label: dayLabel,
        fullDate: dateStr,
        planned,
        completed,
        rate,
        hours,
        isToday: dateStr === format(today, 'yyyy-MM-dd'),
      });
    }

    const overallRate = sumPlanned > 0 ? Math.round((sumCompleted / sumPlanned) * 100) : 0;

    return {
      data: days,
      totalPlanned: sumPlanned,
      totalCompleted: sumCompleted,
      overallRate,
      currentRate: days[days.length - 1]?.rate || 0,
    };
  }

  if (viewMode === 'monthly') {
    // Past 6 months
    const months = [];
    let sumPlanned = 0;
    let sumCompleted = 0;

    for (let i = 5; i >= 0; i--) {
      const d = subMonths(today, i);
      const monthStart = startOfMonth(d);
      const monthEnd = endOfMonth(d);
      const monthLabel = format(d, 'MMMM yyyy');
      const shortLabel = format(d, 'MMM');

      const monthTasks = safeTasks.filter((t) => {
        if (!t || !t.date) return false;
        try {
          const td = parseISO(t.date);
          return td >= monthStart && td <= monthEnd;
        } catch {
          return false;
        }
      });

      const completedInStore = monthTasks.filter((t) => t.status === 'Done').length;
      let hours = 0;
      let logTasksDone = 0;

      safeLogs.forEach((l) => {
        if (!l || !l.date) return;
        try {
          const ld = parseISO(l.date);
          if (ld >= monthStart && ld <= monthEnd) {
            hours += getGenuineLogHours(l);
            logTasksDone += Number(l.tasksCompleted) || 0;
          }
        } catch {}
      });

      const completed = Math.max(completedInStore, logTasksDone);
      const planned = Math.max(monthTasks.length, completed);

      sumPlanned += planned;
      sumCompleted += completed;

      const rate = planned > 0 ? Math.round((completed / planned) * 100) : (completed > 0 ? 100 : 0);

      months.push({
        label: shortLabel,
        fullDate: monthLabel,
        planned,
        completed,
        rate,
        hours: Number(hours.toFixed(1)),
        isCurrent: i === 0,
      });
    }

    const overallRate = sumPlanned > 0 ? Math.round((sumCompleted / sumPlanned) * 100) : 0;

    return {
      data: months,
      totalPlanned: sumPlanned,
      totalCompleted: sumCompleted,
      overallRate,
      currentRate: months[months.length - 1]?.rate || 0,
    };
  }

  // Default: 'weekly' (past 8 weeks leading to current week)
  const weeks = [];
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  let sumPlanned = 0;
  let sumCompleted = 0;

  for (let i = 7; i >= 0; i--) {
    const weekStart = subWeeks(currentWeekStart, i);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekLabel = `W${format(weekStart, 'w')} ${format(weekStart, 'MMM')}`;
    const rangeLabel = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;

    const weekTasks = safeTasks.filter((t) => {
      if (!t || !t.date) return false;
      try {
        const td = parseISO(t.date);
        return td >= weekStart && td <= weekEnd;
      } catch {
        return false;
      }
    });

    const completedInStore = weekTasks.filter((t) => t.status === 'Done').length;
    let hours = 0;
    let logTasksDone = 0;

    safeLogs.forEach((l) => {
      if (!l || !l.date) return;
      try {
        const ld = parseISO(l.date);
        if (ld >= weekStart && ld <= weekEnd) {
          hours += getGenuineLogHours(l);
          logTasksDone += Number(l.tasksCompleted) || 0;
        }
      } catch {}
    });

    const completed = Math.max(completedInStore, logTasksDone);
    const planned = Math.max(weekTasks.length, completed);

    sumPlanned += planned;
    sumCompleted += completed;

    const rate = planned > 0 ? Math.round((completed / planned) * 100) : (completed > 0 ? 100 : 0);

    weeks.push({
      label: weekLabel,
      range: rangeLabel,
      planned,
      completed,
      rate,
      hours: Number(hours.toFixed(1)),
      isCurrent: i === 0,
    });
  }

  const overallRate = sumPlanned > 0 ? Math.round((sumCompleted / sumPlanned) * 100) : 0;

  return {
    data: weeks,
    totalPlanned: sumPlanned,
    totalCompleted: sumCompleted,
    overallRate,
    currentRate: weeks[weeks.length - 1]?.rate || 0,
  };
};
