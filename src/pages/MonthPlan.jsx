import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths 
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarRange, 
  Plus, 
  X,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import TaskItem from '../components/tasks/TaskItem';

export default function MonthPlan({ onOpenNewTask, onEditTask }) {
  const { tasks, subjects } = useTaskStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const selectedDateStr = format(selectedDay, 'yyyy-MM-dd');
  const selectedDayTasks = tasks.filter((t) => t.date === selectedDateStr);

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setIsDayModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Month Navigator */}
      <div className="clay-card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-teal/20 text-brand-teal flex items-center justify-center">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <p className="text-xs text-slate-500">Interactive Calendar & Task Dots</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))}
            className="p-2 rounded-lg neu-pill-btn text-slate-600 dark:text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-1.5 rounded-lg text-xs font-bold neu-pill-btn text-slate-700 dark:text-slate-200"
          >
            Current Month
          </button>
          <button
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            className="p-2 rounded-lg neu-pill-btn text-slate-600 dark:text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="clay-card p-4 sm:p-6 shadow-neu-card">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-2 pb-3 mb-2 border-b border-slate-300/40 dark:border-slate-700/60 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDay);
            const dayTasks = tasks.filter((t) => t.date === dateStr);

            return (
              <div
                key={dateStr}
                onClick={() => handleDayClick(day)}
                className={`min-h-[85px] sm:min-h-[100px] p-2 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between ${
                  !isCurrentMonth
                    ? 'opacity-30 border-transparent bg-slate-200/20 dark:bg-slate-900/10'
                    : isToday
                    ? 'bg-brand-teal/15 border-brand-teal/50 shadow-md'
                    : isSelected
                    ? 'ring-2 ring-brand-blue bg-white/70 dark:bg-slate-800/70 border-brand-blue'
                    : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 border-white/60 dark:border-slate-700/50'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? 'text-brand-teal font-extrabold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Task Dots */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {dayTasks.slice(0, 4).map((task) => {
                    const subj = subjects.find((s) => s.name === task.subject);
                    const color = subj ? subj.color : '#5FB3B3';
                    return (
                      <span
                        key={task.id}
                        className="w-2 h-2 rounded-full shadow-sm"
                        style={{ backgroundColor: color }}
                        title={`${task.title} (${task.subject})`}
                      />
                    );
                  })}
                  {dayTasks.length > 4 && (
                    <span className="text-[9px] font-bold text-slate-500">
                      +{dayTasks.length - 4}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      {isDayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg clay-card p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-300/40 dark:border-slate-700/60">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  {format(selectedDay, 'EEEE, MMMM d, yyyy')}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDayTasks.length} tasks scheduled
                </p>
              </div>
              <button
                onClick={() => setIsDayModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {selectedDayTasks.map((task) => (
                <TaskItem key={task.id} task={task} onEdit={onEditTask} />
              ))}

              {selectedDayTasks.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  No tasks scheduled for this day. Click below to add one!
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-300/40 dark:border-slate-700/60 flex items-center justify-end">
              <button
                onClick={() => {
                  setIsDayModalOpen(false);
                  onOpenNewTask();
                }}
                className="neu-teal-btn flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task to this Day</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
