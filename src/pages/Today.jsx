import React, { useState, useMemo, useEffect } from 'react';
import {
  format,
  addDays,
  subDays,
  isSameDay,
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
  ArrowRight,
  Sparkles,
  Sunrise,
  Sun,
  Moon,
  List,
  Columns,
  Check,
  TrendingUp,
  Edit3,
  Trash2,
  CalendarDays
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import TaskItem from '../components/tasks/TaskItem';
import { formatHourTo12Hour, formatTo12Hour } from '../utils/timeFormat';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

export default function Today({ onOpenNewTask, onEditTask }) {
  const { tasks, subjects, routines, applyRoutineToDate, toggleTaskStatus, deleteTask } = useTaskStore();

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


  // Tasks for the selected date
  const allDateTasks = useMemo(() => {
    return tasks.filter((t) => t.date === selectedDateStr);
  }, [tasks, selectedDateStr]);

  // Filter tasks for selected date and active filters
  const dateTasks = useMemo(() => {
    return allDateTasks.filter((t) => {
      if (selectedSubject !== 'all' && (t.subject || '').trim().toLowerCase() !== selectedSubject.trim().toLowerCase()) return false;
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
  const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

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
      <div className="clay-card p-3 sm:p-4 shadow-glass-card border border-white/10 space-y-3">
        {/* Top: Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-royal-500/20 text-royal-600 dark:text-royal-300 border border-royal-500/30">
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {isToday ? "Today's Schedule" : isTomorrow ? "Tomorrow's Schedule" : isYesterday ? "Yesterday" : format(selectedDate, 'EEEE')}
                </h1>
                {isToday && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-royal-500/20 text-royal-700 dark:text-royal-300 border border-royal-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-royal-600 dark:bg-royal-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                    Live
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                {format(selectedDate, 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
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
        <div className="flex items-center justify-between gap-1 sm:gap-2 pt-1 border-t border-slate-200/80 dark:border-white/10">
          <button
            onClick={handlePrevDay}
            className="p-1 rounded-lg neu-pill-btn text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shrink-0"
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
                  className={`flex flex-col items-center justify-center py-1.5 sm:py-2 px-1 rounded-xl transition-all text-center relative ${isSelected
                      ? 'neu-teal-btn text-white shadow-sm'
                      : isDayToday
                        ? 'bg-royal-100 dark:bg-royal-500/20 border-2 border-royal-500/60 dark:border-royal-500/40 text-royal-700 dark:text-royal-300'
                        : 'neu-pill-btn text-slate-800 dark:text-slate-100 hover:text-royal-600 dark:hover:text-white'
                    }`}
                >
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-white/90' : isDayToday ? 'text-royal-700 dark:text-royal-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    {format(day, 'EEE')}
                  </span>
                  <span className={`text-xs sm:text-sm font-black ${isSelected ? 'text-white' : isDayToday ? 'text-royal-800 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="h-1 mt-0.5">
                    {dayTasks.length > 0 && (
                      <span className={`block w-1.5 h-1.5 rounded-full ${dayDone ? 'bg-emerald-400' : isSelected ? 'bg-white' : 'bg-royal-500 dark:bg-royal-400'}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextDay}
            className="p-1 rounded-lg neu-pill-btn text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shrink-0"
            aria-label="Next day"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Compact Daily Progress Strip */}
      <div className="clay-card p-3 sm:p-3.5 flex flex-col justify-between gap-2 shadow-glass-card border border-white/10">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-royal-600 dark:text-royal-400" />
            Daily Progress
          </span>
          <span className="font-extrabold text-royal-700 dark:text-royal-300">
            {completionPercentage}% Done • {completedTasksCount}/{totalTasksCount} tasks
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-300/60 dark:bg-slate-900/60 overflow-hidden neu-inset">
          <div
            className="h-full rounded-full bg-gradient-to-r from-royal-600 via-royal-500 to-violet-neon shadow-[0_0_12px_rgba(168,85,247,0.5)] transition-all duration-300"
            style={{ width: `${Math.max(4, completionPercentage)}%` }}
          />
        </div>
      </div>

      {/* 4. SHORT & COMPACT HOURLY TIMELINE */}
      <div className="clay-card p-3.5 sm:p-4 shadow-glass-card border border-white/10 space-y-3">
        {/* Timeline Header & Range Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-white/10 gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-royal-500/20 text-royal-600 dark:text-royal-300 border border-royal-500/30">
              <Clock className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Hourly Schedule
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-neon/20 text-violet-700 dark:text-violet-neon-bright border border-violet-neon/30">
              {dateTasks.length} planned
            </span>
          </div>

          {/* Quick Range Selector (Keeps page short & clean) */}
          <div className="flex items-center bg-slate-200/80 dark:bg-[#0A1128]/80 backdrop-blur-md p-1 rounded-xl border border-slate-300/60 dark:border-white/10 text-[11px] font-bold overflow-x-auto">
            <button
              onClick={() => setTimelineRange('planned')}
              className={`px-2.5 py-1 rounded-lg transition-all ${timelineRange === 'planned'
                  ? 'neu-teal-btn text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
                }`}
            >
              Planned Only ({dateTasks.length})
            </button>
            <button
              onClick={() => setTimelineRange('morning')}
              className={`px-2 py-1 rounded-lg transition-all ${timelineRange === 'morning'
                  ? 'neu-teal-btn text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
                }`}
            >
              Morning
            </button>
            <button
              onClick={() => setTimelineRange('afternoon')}
              className={`px-2 py-1 rounded-lg transition-all ${timelineRange === 'afternoon'
                  ? 'neu-teal-btn text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
                }`}
            >
              Afternoon
            </button>
            <button
              onClick={() => setTimelineRange('evening')}
              className={`px-2 py-1 rounded-lg transition-all ${timelineRange === 'evening'
                  ? 'neu-teal-btn text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
                }`}
            >
              Evening
            </button>
            <button
              onClick={() => setTimelineRange('full')}
              className={`px-2 py-1 rounded-lg transition-all ${timelineRange === 'full'
                  ? 'neu-teal-btn text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
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
                    (s) => s.id === task.subjectId || s.name.toLowerCase() === (task.subject || '').trim().toLowerCase()
                  );
                  const subjectColor = subjectObj ? subjectObj.color : '#3B82F6';
                  const isDone = task.status === 'Done';
                  const formattedStart = task.startTime ? formatTo12Hour(task.startTime) : 'Flexible';
                  const [taskHour] = (task.startTime || '00:00').split(':').map(Number);
                  const isCurrent = isToday && currentHour === taskHour;

                  return (
                    <div
                      key={task.id}
                      className={`group flex items-start sm:items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all duration-150 backdrop-blur-md ${isDone
                          ? 'bg-slate-100/80 dark:bg-[#070B19]/60 border-slate-200/80 dark:border-white/5 opacity-85'
                          : isCurrent
                            ? 'bg-royal-50/90 dark:bg-royal-950/70 border-royal-400/80 dark:border-royal-500/60 shadow-[0_0_15px_rgba(37,99,235,0.25)] ring-1 ring-royal-400/50'
                            : 'bg-white/80 dark:bg-[#0E1636]/75 hover:bg-white dark:hover:bg-[#152048] border-slate-200/90 dark:border-white/10 shadow-xs hover:shadow-md'
                        }`}
                      style={{ borderLeftWidth: '4px', borderLeftColor: subjectColor }}
                    >
                      {/* Left: Checkbox + Content */}
                      <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={(e) => handleToggleTask(task, e)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 mt-0.5 sm:mt-0 ${isDone
                              ? 'bg-gradient-to-r from-royal-600 to-violet-neon text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                              : 'border-2 border-slate-400 dark:border-slate-500 hover:border-royal-500 bg-white/50 dark:bg-white/5'
                            }`}
                          aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        {/* Title, Time & Badges */}
                        <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
                          {/* Title - clearly visible, wraps onto next line if long, no aggressive cut-off */}
                          <div className="min-w-0 flex-1">
                            <span
                              onClick={() => onEditTask?.(task)}
                              className={`text-xs sm:text-sm font-bold break-words line-clamp-2 sm:line-clamp-none cursor-pointer hover:underline block leading-snug ${isDone
                                  ? 'line-through text-slate-500 dark:text-slate-400'
                                  : 'text-slate-900 dark:text-white'
                                }`}
                              title={task.title}
                            >
                              {task.title}
                            </span>
                          </div>

                          {/* Time, Subject & Priority tags */}
                          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                            {/* Start time pill */}
                            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-royal-700 dark:text-royal-300 bg-royal-100/80 dark:bg-royal-500/20 border border-royal-300/80 dark:border-royal-500/30 px-1.5 sm:px-2 py-0.5 rounded-md shrink-0">
                              {formattedStart}
                            </span>

                            {task.subject && (
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                                style={{
                                  backgroundColor: `${subjectColor}18`,
                                  color: subjectColor,
                                  border: `1px solid ${subjectColor}45`,
                                }}
                              >
                                {task.subject}
                              </span>
                            )}

                            {task.priority === 'High' && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-brand-coral/20 text-rose-700 dark:text-brand-coral border border-rose-300 dark:border-brand-coral/30 shrink-0">
                                High
                              </span>
                            )}

                            <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold sm:hidden">
                              {task.duration || 60}m
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 shrink-0 ml-2 mt-0.5 sm:mt-0">
                        <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold hidden sm:inline mr-1">
                          {task.duration || 60}m
                        </span>

                        <button
                          onClick={() => onEditTask?.(task)}
                          className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
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
          <div className="max-h-[320px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-200/50 dark:divide-white/5">
            {filteredRangeHours.map((hour) => {
              const hourTasks = getTasksForHour(hour);
              const formattedHour = formatHourTo12Hour(hour);
              const isCurrent = isToday && currentHour === hour;

              return (
                <div
                  key={hour}
                  className={`flex items-center gap-2 py-1.5 px-2 rounded-xl transition-colors ${isCurrent ? 'bg-royal-100/70 dark:bg-royal-500/15 border border-royal-300 dark:border-royal-500/30 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : 'hover:bg-slate-100/60 dark:hover:bg-white/5'
                    }`}
                >
                  {/* Time label */}
                  <span className={`w-16 shrink-0 text-[11px] font-mono font-bold ${isCurrent ? 'text-violet-600 dark:text-violet-neon-bright font-black drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]' : 'text-slate-600 dark:text-slate-400'}`}>
                    {formattedHour}
                  </span>

                  {/* Slot or tasks */}
                  <div className="flex-1 min-w-0">
                    {hourTasks.length > 0 ? (
                      <div className="space-y-1">
                        {hourTasks.map((t) => (
                          <div
                            key={t.id}
                            className="p-1.5 sm:p-2 rounded-lg bg-white/80 dark:bg-[#0E1636]/80 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between hover:border-violet-500/40 hover:shadow-glass-card transition-all"
                          >
                            <span 
                              onClick={() => onEditTask?.(t)}
                              className="break-words line-clamp-2 cursor-pointer hover:underline flex-1 min-w-0"
                            >
                              {t.title}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              <span className="text-[10px] text-royal-600 dark:text-royal-300 font-semibold">
                                {t.duration || 60}m
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditTask?.(t);
                                }}
                                className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTask(t.id);
                                }}
                                className="p-0.5 text-slate-400 hover:text-rose-500 transition-colors"
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddSlotAtHour(hour)}
                        className="w-full py-1 px-2 rounded-lg border border-dashed border-slate-300 dark:border-white/15 text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-royal-600 dark:hover:text-royal-300 hover:border-royal-400 dark:hover:border-royal-500/50 hover:bg-royal-50/50 dark:hover:bg-royal-500/10 text-left transition-colors flex items-center justify-between group"
                      >
                        <span>Available</span>
                        <span className="opacity-0 group-hover:opacity-100 text-royal-600 dark:text-royal-300 font-bold transition-opacity">+ Book</span>
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
