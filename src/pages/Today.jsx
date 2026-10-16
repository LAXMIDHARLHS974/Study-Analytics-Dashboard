import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  format, 
  addDays, 
  subDays, 
  isSameDay, 
  parseISO, 
  startOfDay, 
  isBefore, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval 
} from 'date-fns';
import { 
  Clock, 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Play,
  Sunrise,
  Sun,
  Moon,
  List,
  Columns,
  Check,
  TrendingUp,
  Edit3,
  CalendarDays
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import TaskItem from '../components/tasks/TaskItem';
import { formatHourTo12Hour, formatTo12Hour } from '../utils/timeFormat';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

export default function Today({ onOpenNewTask, onEditTask }) {
  const navigate = useNavigate();
  const { tasks, subjects, routines, carryForwardOverdueTasks, applyRoutineToDate, toggleTaskStatus } = useTaskStore();
  const { setTimerState } = useSettingsStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'done'
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'blocks' | 'list'
  const [timelineRange, setTimelineRange] = useState('planned'); // 'planned' | 'morning' | 'afternoon' | 'evening' | 'full'
  const [routineAppliedMessage, setRoutineAppliedMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current live time every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = isSameDay(selectedDate, new Date());
  const isTomorrow = isSameDay(selectedDate, addDays(new Date(), 1));
  const isYesterday = isSameDay(selectedDate, subDays(new Date(), 1));

  const currentHour = currentTime.getHours();
  const formattedCurrentTime = format(currentTime, 'h:mm a');

  // Overdue check
  const todayStart = startOfDay(new Date());
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'Done') return false;
    try {
      return isBefore(parseISO(t.date), todayStart);
    } catch {
      return false;
    }
  });

  // Tasks for the selected date
  const allDateTasks = useMemo(() => {
    return tasks.filter((t) => t.date === selectedDateStr);
  }, [tasks, selectedDateStr]);

  // Filter tasks for selected date and active filters
  const dateTasks = useMemo(() => {
    return allDateTasks.filter((t) => {
      if (selectedSubject !== 'all' && t.subject !== selectedSubject) return false;
      if (statusFilter === 'pending' && t.status === 'Done') return false;
      if (statusFilter === 'done' && t.status !== 'Done') return false;
      return true;
    });
  }, [allDateTasks, selectedSubject, statusFilter]);

  // Chronologically sorted planned tasks (for compact planned timeline)
  const sortedPlannedTasks = useMemo(() => {
    return [...dateTasks].sort((a, b) => {
      if (!a.startTime && !b.startTime) return 0;
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [dateTasks]);

  // Calculate daily stats
  const totalTasksCount = allDateTasks.length;
  const completedTasksCount = allDateTasks.filter((t) => t.status === 'Done').length;
  const totalPlannedMinutes = allDateTasks.reduce((acc, t) => acc + (Number(t.duration) || 60), 0);
  const totalPlannedHours = (totalPlannedMinutes / 60).toFixed(1);
  const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Next up pending task
  const nextPendingTask = useMemo(() => {
    return allDateTasks.find((t) => t.status !== 'Done') || null;
  }, [allDateTasks]);

  // Generate 7-day strip based on current selected date
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  // Hours for specific grid range
  const filteredRangeHours = useMemo(() => {
    if (timelineRange === 'morning') return [6, 7, 8, 9, 10, 11];
    if (timelineRange === 'afternoon') return [12, 13, 14, 15, 16];
    if (timelineRange === 'evening') return [17, 18, 19, 20, 21, 22, 23];
    return Array.from({ length: 18 }, (_, i) => i + 6); // full day
  }, [timelineRange]);

  const getTasksForHour = (hour) => {
    return dateTasks.filter((task) => {
      if (!task.startTime) return false;
      const [h] = task.startTime.split(':').map(Number);
      return h === hour;
    });
  };

  // Group tasks by time of day for Block view
  const categorizedTasks = useMemo(() => {
    const morning = [];
    const afternoon = [];
    const evening = [];

    dateTasks.forEach((task) => {
      if (!task.startTime) {
        morning.push(task);
        return;
      }
      const [h] = task.startTime.split(':').map(Number);
      if (h < 12) morning.push(task);
      else if (h < 17) afternoon.push(task);
      else evening.push(task);
    });

    return { morning, afternoon, evening };
  }, [dateTasks]);

  const handlePrevDay = () => setSelectedDate((d) => addDays(d, -1));
  const handleNextDay = () => setSelectedDate((d) => addDays(d, 1));
  const handleSetToday = () => setSelectedDate(new Date());
  const handleSetTomorrow = () => setSelectedDate(addDays(new Date(), 1));

  const handleStartTimerOnTask = (task) => {
    setTimerState({
      activeTaskId: task.id,
      activeSubject: task.subject,
      timerSecondsLeft: (task.duration || 25) * 60,
      isTimerRunning: true,
      timerMode: 'work',
    });
    navigate('/timer');
  };

  const handleToggleTask = (task, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const isNowDone = toggleTaskStatus(task.id);
    if (isNowDone) {
      soundManager.playSuccess();
      triggerConfetti({
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      });
    }
  };

  const handleAddSlotAtHour = (hour) => {
    const formattedHourStr = `${String(hour).padStart(2, '0')}:00`;
    const endHourStr = `${String((hour + 1) % 24).padStart(2, '0')}:00`;
    if (typeof onEditTask === 'function') {
      onEditTask({
        date: selectedDateStr,
        startTime: formattedHourStr,
        endTime: endHourStr,
        duration: 60,
      });
    } else if (typeof onOpenNewTask === 'function') {
      onOpenNewTask();
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-200 max-w-5xl mx-auto pb-8">
      {/* 1. Compact Header & 7-Day Ribbon */}
      <div className="clay-card p-3 sm:p-4 shadow-neu-card border border-white/60 dark:border-slate-700/60 space-y-3">
        {/* Top: Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-teal/15 text-brand-teal">
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-800 dark:text-white tracking-tight">
                  {isToday ? "Today's Schedule" : isTomorrow ? "Tomorrow's Schedule" : isYesterday ? "Yesterday" : format(selectedDate, 'EEEE')}
                </h1>
                {isToday && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {format(selectedDate, 'MMM d, yyyy')} • {allDateTasks.length} session{allDateTasks.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleSetToday}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                isToday ? 'neu-teal-btn text-white' : 'neu-pill-btn text-slate-700 dark:text-slate-300'
              }`}
            >
              Today
            </button>
            <button
              onClick={handleSetTomorrow}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                isTomorrow ? 'neu-teal-btn text-white' : 'neu-pill-btn text-slate-700 dark:text-slate-300'
              }`}
            >
              Tomorrow
            </button>
            <button
              onClick={() => onOpenNewTask?.()}
              className="neu-teal-btn flex items-center gap-1 px-3 py-1 text-xs font-bold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* 7-Day Mini Ribbon */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={handlePrevDay}
            className="p-1 rounded-lg neu-pill-btn text-slate-500 hover:text-slate-900 shrink-0"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 flex-1">
            {weekDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isSelected = isSameDay(day, selectedDate);
              const isDayToday = isSameDay(day, new Date());
              const dayTasks = tasks.filter((t) => t.date === dayStr);
              const dayDone = dayTasks.length > 0 && dayTasks.every((t) => t.status === 'Done');

              return (
                <button
                  key={dayStr}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center justify-center py-1.5 sm:py-2 px-1 rounded-xl transition-all text-center relative ${
                    isSelected
                      ? 'neu-teal-btn text-white shadow-sm'
                      : isDayToday
                      ? 'bg-brand-teal/15 border border-brand-teal/40 text-brand-teal'
                      : 'neu-pill-btn text-slate-700 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <span className={`text-[9px] font-bold uppercase ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                    {format(day, 'EEE')}
                  </span>
                  <span className={`text-xs font-black ${isSelected ? 'text-white' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="h-1 mt-0.5">
                    {dayTasks.length > 0 && (
                      <span className={`block w-1.5 h-1.5 rounded-full ${dayDone ? 'bg-brand-mint' : isSelected ? 'bg-white' : 'bg-brand-teal'}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextDay}
            className="p-1 rounded-lg neu-pill-btn text-slate-500 hover:text-slate-900 shrink-0"
            aria-label="Next day"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Compact Daily Progress Strip */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3">
        {/* Progress bar */}
        <div className="md:col-span-7 clay-card p-3 sm:p-3.5 flex flex-col justify-between gap-2 shadow-sm border border-white/60 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-brand-blue" />
              Daily Progress
            </span>
            <span className="font-extrabold text-brand-teal">
              {completionPercentage}% Done • {completedTasksCount}/{totalTasksCount} tasks
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-300/40 dark:bg-slate-700/50 overflow-hidden neu-inset">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-brand-teal to-brand-mint transition-all duration-300"
              style={{ width: `${Math.max(4, completionPercentage)}%` }}
            />
          </div>
        </div>

        {/* Next Focus Card */}
        <div className="md:col-span-5 clay-card p-3 sm:p-3.5 flex items-center justify-between gap-2 shadow-sm border border-white/60 dark:border-slate-700/60">
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Next Focus Session
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
              {nextPendingTask ? nextPendingTask.title : totalTasksCount > 0 ? "All completed 🎉" : "No session scheduled"}
            </p>
          </div>
          {nextPendingTask && (
            <button
              onClick={() => handleStartTimerOnTask(nextPendingTask)}
              className="neu-teal-btn px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs active:scale-95 transition-all"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Focus</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Overdue Alert (if any) */}
      {isToday && overdueTasks.length > 0 && (
        <div className="clay-card p-2.5 sm:p-3 bg-brand-coral/10 border border-brand-coral/30 flex items-center justify-between gap-2 rounded-xl text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-brand-coral shrink-0" />
            <span className="font-bold text-slate-800 dark:text-white truncate">
              {overdueTasks.length} pending task{overdueTasks.length > 1 ? 's' : ''} from previous days
            </span>
          </div>
          <button
            onClick={() => carryForwardOverdueTasks(selectedDateStr)}
            className="neu-pill-btn px-2.5 py-1 text-[11px] font-bold text-brand-coral shrink-0"
          >
            Move to Today →
          </button>
        </div>
      )}

      {/* 4. SHORT & COMPACT HOURLY TIMELINE */}
      <div className="clay-card p-3.5 sm:p-4 shadow-neu-card border border-white/60 dark:border-slate-700/60 space-y-3">
        {/* Timeline Header & Range Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60 gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-teal/15 text-brand-teal">
              <Clock className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-black text-slate-800 dark:text-white">
              Hourly Schedule
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-teal/15 text-brand-teal">
              {dateTasks.length} planned
            </span>
          </div>

          {/* Quick Range Selector (Keeps page short!) */}
          <div className="flex items-center bg-slate-200/50 dark:bg-slate-900/40 p-0.5 rounded-xl border border-white/40 dark:border-slate-800 text-[11px] font-bold overflow-x-auto">
            <button
              onClick={() => setTimelineRange('planned')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timelineRange === 'planned'
                  ? 'neu-teal-btn text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Planned Only ({dateTasks.length})
            </button>
            <button
              onClick={() => setTimelineRange('morning')}
              className={`px-2 py-1 rounded-lg transition-all ${
                timelineRange === 'morning'
                  ? 'neu-teal-btn text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Morning
            </button>
            <button
              onClick={() => setTimelineRange('afternoon')}
              className={`px-2 py-1 rounded-lg transition-all ${
                timelineRange === 'afternoon'
                  ? 'neu-teal-btn text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Afternoon
            </button>
            <button
              onClick={() => setTimelineRange('evening')}
              className={`px-2 py-1 rounded-lg transition-all ${
                timelineRange === 'evening'
                  ? 'neu-teal-btn text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Evening
            </button>
            <button
              onClick={() => setTimelineRange('full')}
              className={`px-2 py-1 rounded-lg transition-all ${
                timelineRange === 'full'
                  ? 'neu-teal-btn text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Full Day
            </button>
          </div>
        </div>

        {/* Content of Timeline: Short & Concise */}
        {timelineRange === 'planned' ? (
          /* ============ DEFAULT: PLANNED SESSIONS (SHORT & SWEET) ============ */
          <div className="space-y-2">
            {sortedPlannedTasks.length > 0 ? (
              <div className="space-y-2">
                {sortedPlannedTasks.map((task) => {
                  const subjectObj = subjects.find(
                    (s) => s.id === task.subjectId || s.name === task.subject
                  );
                  const subjectColor = subjectObj ? subjectObj.color : '#5FB3B3';
                  const isDone = task.status === 'Done';
                  const formattedStart = task.startTime ? formatTo12Hour(task.startTime) : 'Flexible';
                  const [taskHour] = (task.startTime || '00:00').split(':').map(Number);
                  const isCurrent = isToday && currentHour === taskHour;

                  return (
                    <div
                      key={task.id}
                      className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 ${
                        isDone
                          ? 'bg-slate-200/40 dark:bg-slate-900/40 border-slate-300/40 dark:border-slate-800/60 opacity-60'
                          : isCurrent
                          ? 'bg-brand-teal/10 dark:bg-slate-800/90 border-brand-teal/40 shadow-xs ring-1 ring-brand-teal/30'
                          : 'bg-white/80 dark:bg-slate-800/85 hover:bg-white dark:hover:bg-slate-800 border-white/80 dark:border-slate-700/80 shadow-xs hover:shadow-sm'
                      }`}
                      style={{ borderLeftWidth: '4px', borderLeftColor: subjectColor }}
                    >
                      {/* Left: Checkbox, Time, Title */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={(e) => handleToggleTask(task, e)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${
                            isDone
                              ? 'bg-brand-mint text-white'
                              : 'border-2 border-slate-400 hover:border-brand-teal bg-white/80 dark:bg-slate-700/50'
                          }`}
                          aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        {/* Start time pill */}
                        <span className="text-[11px] font-mono font-bold text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded-md shrink-0">
                          {formattedStart}
                        </span>

                        {/* Title & Subject */}
                        <div className="min-w-0 flex-1 flex items-center gap-2 truncate">
                          <span
                            className={`text-xs sm:text-sm font-bold truncate ${
                              isDone
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-800 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </span>

                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded truncate shrink-0 hidden sm:inline"
                            style={{
                              backgroundColor: `${subjectColor}20`,
                              color: subjectColor,
                              border: `1px solid ${subjectColor}40`,
                            }}
                          >
                            {task.subject}
                          </span>

                          {task.priority === 'High' && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-brand-coral/20 text-brand-coral border border-brand-coral/30 shrink-0">
                              High
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Duration & Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="text-[10px] text-slate-400 font-semibold hidden xs:inline">
                          {task.duration || 60}m
                        </span>

                        {!isDone && (
                          <button
                            onClick={() => handleStartTimerOnTask(task)}
                            className="neu-teal-btn px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                            title="Start Focus Timer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span className="hidden sm:inline">Focus</span>
                          </button>
                        )}

                        <button
                          onClick={() => onEditTask?.(task)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Quick Add Slot under planned sessions */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Total: {totalPlannedHours} hrs planned today
                  </span>
                  <button
                    onClick={() => onOpenNewTask?.()}
                    className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add another session</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No sessions scheduled for {format(selectedDate, 'MMM d')}
                </p>
                <button
                  onClick={() => onOpenNewTask?.()}
                  className="neu-teal-btn px-3.5 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule First Session</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ============ FILTERED GRID (CONTAINED & SCROLLABLE, NEVER LONG!) ============ */
          <div className="max-h-[320px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-200/50 dark:divide-slate-800/60">
            {filteredRangeHours.map((hour) => {
              const hourTasks = getTasksForHour(hour);
              const formattedHour = formatHourTo12Hour(hour);
              const isCurrent = isToday && currentHour === hour;

              return (
                <div
                  key={hour}
                  className={`flex items-center gap-2 py-1.5 px-2 rounded-xl transition-colors ${
                    isCurrent ? 'bg-brand-teal/10' : 'hover:bg-slate-200/30 dark:hover:bg-slate-800/30'
                  }`}
                >
                  {/* Time label */}
                  <span className={`w-16 shrink-0 text-[11px] font-mono font-bold ${isCurrent ? 'text-brand-coral font-black' : 'text-slate-500'}`}>
                    {formattedHour}
                  </span>

                  {/* Slot or tasks */}
                  <div className="flex-1 min-w-0">
                    {hourTasks.length > 0 ? (
                      <div className="space-y-1">
                        {hourTasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => onEditTask?.(t)}
                            className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800 border border-white/90 dark:border-slate-700 text-xs font-bold flex items-center justify-between cursor-pointer hover:shadow-xs"
                          >
                            <span className="truncate">{t.title}</span>
                            <span className="text-[10px] text-brand-teal font-normal shrink-0 ml-2">
                              {t.duration || 60}m
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddSlotAtHour(hour)}
                        className="w-full py-1 px-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-[10px] font-semibold text-slate-400 hover:text-brand-teal hover:border-brand-teal text-left transition-colors flex items-center justify-between"
                      >
                        <span>Available</span>
                        <span className="opacity-0 group-hover:opacity-100 text-brand-teal font-bold">+ Book</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
