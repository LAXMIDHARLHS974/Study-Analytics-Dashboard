import React, { useState } from 'react';
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  addWeeks, 
  isSameDay 
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CalendarDays, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import TaskItem from '../components/tasks/TaskItem';

export default function WeekPlan({ onOpenNewTask, onEditTask }) {
  const { tasks } = useTaskStore();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const baseDate = addWeeks(new Date(), currentWeekOffset);
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekDateStrings = weekDays.map((d) => format(d, 'yyyy-MM-dd'));
  const weekTasks = tasks.filter((t) => weekDateStrings.includes(t.date));
  const completedWeekTasks = weekTasks.filter((t) => t.status === 'Done').length;
  const totalWeekTasks = weekTasks.length;
  const weekProgressPct = totalWeekTasks > 0 ? Math.round((completedWeekTasks / totalWeekTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Week Navigator (Square Box Bar) */}
      <div className="clay-card p-4 sm:p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
              {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
            </h2>
          </div>
        </div>

        {/* Square Weekly Progress Bar & Navigator */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Square Progress Box */}
          <div className="p-2.5 rounded-lg neu-inset min-w-[200px] flex-1 md:flex-none">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
              <span>Weekly Completion</span>
              <span className="text-brand-teal font-extrabold">{completedWeekTasks}/{totalWeekTasks} ({weekProgressPct}%)</span>
            </div>
            <div className="w-full h-2 rounded-sm bg-slate-300/40 dark:bg-slate-700/60 overflow-hidden border border-slate-300/40 dark:border-slate-700/50">
              <div
                className="h-full bg-brand-teal transition-all duration-300"
                style={{ width: `${weekProgressPct}%` }}
              />
            </div>
          </div>

          {/* Square Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
              className="p-2 rounded-lg neu-pill-btn text-slate-600 dark:text-slate-300 hover:text-slate-900"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentWeekOffset(0)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold neu-pill-btn text-slate-700 dark:text-slate-200"
            >
              This Week
            </button>
            <button
              onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
              className="p-2 rounded-lg neu-pill-btn text-slate-600 dark:text-slate-300 hover:text-slate-900"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Columns Grid (Square Boxes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isToday = isSameDay(day, new Date());
          const dayTasks = tasks.filter((t) => t.date === dateStr);
          const completedCount = dayTasks.filter((t) => t.status === 'Done').length;
          const completionPct = dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;

          return (
            <div
              key={dateStr}
              className={`clay-card p-3 rounded-xl flex flex-col justify-between min-h-[160px] md:min-h-[400px] transition-all ${
                isToday ? 'ring-2 ring-brand-teal shadow-lg' : ''
              }`}
            >
              {/* Day Header (Square Box Layout) */}
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-300/40 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg neu-inset flex items-center justify-center font-black text-sm text-slate-800 dark:text-white shrink-0">
                      {format(day, 'd')}
                    </div>
                    <div>
                      <h3
                        className={`text-[11px] font-extrabold tracking-wider uppercase ${
                          isToday ? 'text-brand-teal' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {format(day, 'EEE')}
                      </h3>
                      {isToday && (
                        <span className="text-[9px] font-bold text-brand-teal uppercase">
                          TODAY
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Square Task Counter Badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                      completedCount === dayTasks.length && dayTasks.length > 0
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {completedCount}/{dayTasks.length}
                  </span>
                </div>

                {/* Day Completion Square Progress Bar */}
                {dayTasks.length > 0 && (
                  <div className="w-full h-2 rounded-sm bg-slate-200 dark:bg-slate-800 mt-2 overflow-hidden border border-slate-300/30 dark:border-slate-700/40">
                    <div
                      className="h-full bg-brand-teal transition-all duration-300"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                )}

                {/* Tasks List as Square Cards */}
                <div className="mt-3 space-y-2.5">
                  {dayTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onEdit={onEditTask} variant="square" />
                  ))}

                  {dayTasks.length === 0 && (
                    <div className="py-4 md:py-8 text-center">
                      <span className="text-[11px] text-slate-400 font-medium">
                        No tasks planned
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Add (Square Box Button) */}
              <button
                onClick={onOpenNewTask}
                className="w-full mt-3 py-2 rounded-lg border border-dashed border-slate-300/70 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-brand-teal hover:border-brand-teal flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
