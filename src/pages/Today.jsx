import React, { useState } from 'react';
import { format, addDays, isSameDay, parseISO, startOfDay, isBefore } from 'date-fns';
import { 
  Clock, 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import TaskItem from '../components/tasks/TaskItem';
import { formatHourTo12Hour } from '../utils/timeFormat';

export default function Today({ onOpenNewTask, onEditTask }) {
  const { tasks, subjects, carryForwardOverdueTasks } = useTaskStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSubject, setSelectedSubject] = useState('all');

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = isSameDay(selectedDate, new Date());
  const isTomorrow = isSameDay(selectedDate, addDays(new Date(), 1));

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

  // Filter tasks for selected date
  const dateTasks = tasks.filter((t) => {
    if (t.date !== selectedDateStr) return false;
    if (selectedSubject !== 'all' && t.subject !== selectedSubject) return false;
    return true;
  });

  // Timeline hours from 06:00 to 23:00
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  // Group tasks by hour
  const getTasksForHour = (hour) => {
    return dateTasks.filter((task) => {
      if (!task.startTime) return false;
      const [h] = task.startTime.split(':').map(Number);
      return h === hour;
    });
  };

  const handlePrevDay = () => setSelectedDate((d) => addDays(d, -1));
  const handleNextDay = () => setSelectedDate((d) => addDays(d, 1));
  const handleSetToday = () => setSelectedDate(new Date());
  const handleSetTomorrow = () => setSelectedDate(addDays(new Date(), 1));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Controls Card */}
      <div className="clay-card p-3 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Quick Date Presets */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          <button
            onClick={handleSetToday}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              isToday
                ? 'neu-teal-btn text-white'
                : 'neu-pill-btn text-slate-700 dark:text-slate-300'
            }`}
          >
            Today ({format(new Date(), 'MMM d')})
          </button>
          <button
            onClick={handleSetTomorrow}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              isTomorrow
                ? 'neu-teal-btn text-white'
                : 'neu-pill-btn text-slate-700 dark:text-slate-300'
            }`}
          >
            Tomorrow ({format(addDays(new Date(), 1), 'MMM d')})
          </button>
        </div>

        {/* Center: Date Navigator */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={handlePrevDay}
            aria-label="Previous Day"
            className="p-1.5 sm:p-2 rounded-full neu-pill-btn text-slate-600 dark:text-slate-300 hover:text-slate-900"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 sm:gap-2 text-center">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal shrink-0" />
            <span className="sm:hidden">{format(selectedDate, 'EEE, MMM d, yyyy')}</span>
            <span className="hidden sm:inline">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
          </span>

          <button
            onClick={handleNextDay}
            aria-label="Next Day"
            className="p-1.5 sm:p-2 rounded-full neu-pill-btn text-slate-600 dark:text-slate-300 hover:text-slate-900"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Subject Filter & Add Task */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-full neu-inset border border-white/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex-1 md:flex-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenNewTask}
            className="neu-teal-btn flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold shadow shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* Overdue alert if any */}
      {isToday && overdueTasks.length > 0 && (
        <div className="clay-card p-3 sm:p-4 bg-brand-coral/10 border border-brand-coral/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-coral/20 text-brand-coral flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                {overdueTasks.length} pending task{overdueTasks.length > 1 ? 's' : ''} from previous days
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-500">
                Keep your streak going by carrying them forward.
              </p>
            </div>
          </div>
          <button
            onClick={() => carryForwardOverdueTasks(selectedDateStr)}
            className="neu-pill-btn px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-brand-coral hover:bg-brand-coral hover:text-white flex items-center justify-center gap-1.5 w-full sm:w-auto shrink-0"
          >
            <span>Move to {isToday ? 'Today' : 'This Date'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hourly Timeline View */}
      <div className="clay-card p-4 sm:p-6 shadow-neu-card space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-300/40 dark:border-slate-700/60 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Hour Timeline</span>
          <span>{dateTasks.length} Scheduled Tasks</span>
        </div>

        <div className="space-y-3">
          {hours.map((hour) => {
            const hourTasks = getTasksForHour(hour);
            const formattedHour = formatHourTo12Hour(hour);
            const currentHour = new Date().getHours();
            const isCurrent = isToday && currentHour === hour;

            return (
              <div
                key={hour}
                className={`relative flex items-start gap-3 sm:gap-4 p-2 rounded-2xl transition-all ${
                  isCurrent
                    ? 'bg-brand-teal/10 border border-brand-teal/40'
                    : 'hover:bg-slate-200/30 dark:hover:bg-slate-800/30'
                }`}
              >
                {/* Hour Label */}
                <div className="w-16 sm:w-20 pt-1 shrink-0 text-right">
                  <span
                    className={`text-xs font-extrabold tracking-tight ${
                      isCurrent
                        ? 'text-brand-teal'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {formattedHour}
                  </span>
                  {isCurrent && (
                    <span className="block text-[9px] font-bold text-brand-teal uppercase tracking-widest">
                      NOW
                    </span>
                  )}
                </div>

                {/* Timeline Bar Divider */}
                <div className="relative flex flex-col items-center self-stretch">
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
                      hourTasks.length > 0
                        ? 'bg-brand-teal border-white dark:border-slate-800'
                        : 'border-slate-400/60 bg-transparent'
                    }`}
                  />
                  <div className="w-0.5 flex-1 bg-slate-300/60 dark:bg-slate-700/60 my-1" />
                </div>

                {/* Task Slots or Quick Add Button */}
                <div className="flex-1 min-w-0 space-y-2">
                  {hourTasks.length > 0 ? (
                    hourTasks.map((task) => (
                      <TaskItem key={task.id} task={task} onEdit={onEditTask} />
                    ))
                  ) : (
                    <button
                      onClick={onOpenNewTask}
                      className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300/80 dark:border-slate-700 text-[11px] font-semibold text-slate-400 hover:text-brand-teal hover:border-brand-teal flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Plan study session at {formattedHour}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
