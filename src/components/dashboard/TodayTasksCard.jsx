import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Check, Clock, ChevronRight } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { soundManager } from '../../utils/audio';
import { triggerConfetti } from '../../utils/confetti';
import { formatTo12Hour } from '../../utils/timeFormat';
import { format } from 'date-fns';

export default function TodayTasksCard({ onOpenNewTask }) {
  const navigate = useNavigate();
  const { tasks, toggleTaskStatus, subjects } = useTaskStore();
  const { setTimerState } = useSettingsStore();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const displayTasks = todayTasks.length > 0 ? todayTasks.slice(0, 3) : tasks.slice(0, 3);

  const handleStartTimer = (task) => {
    setTimerState({
      activeTaskId: task.id,
      activeSubject: task.subject,
      timerSecondsLeft: (task.duration || 25) * 60,
      isTimerRunning: true,
      timerMode: 'work',
    });
    navigate('/timer');
  };

  const handleToggle = (task, e) => {
    const isNowDone = toggleTaskStatus(task.id);
    if (isNowDone) {
      soundManager.playSuccess();
      const rect = e.currentTarget.getBoundingClientRect();
      triggerConfetti({
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      });
    }
  };

  return (
    <div className="clay-card p-4 sm:p-5 flex flex-col justify-between h-full">
      {/* Header matching screenshot */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">
          Today's Tasks
        </h3>
        <button
          onClick={() => navigate('/today')}
          className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-0.5 neu-pill-btn px-2.5 py-1 rounded-lg"
        >
          <span>See All</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5 flex-1">
        {displayTasks.map((task) => {
          const subject = subjects.find((s) => s.name === task.subject);
          const color = subject ? subject.color : '#5FB3B3';
          const isDone = task.status === 'Done';
          const time12h = formatTo12Hour(task.startTime || '10:00');

          return (
            <div
              key={task.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                isDone
                  ? 'bg-slate-200/40 dark:bg-slate-800/30 opacity-60 border-transparent'
                  : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 border-white/80 dark:border-slate-700/60 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Square checkbox button */}
                <button
                  type="button"
                  onClick={(e) => handleToggle(task, e)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                    isDone
                      ? 'bg-brand-mint text-white'
                      : 'border-2 border-slate-400 hover:border-brand-teal bg-white/80'
                  }`}
                >
                  {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <h4
                    className={`text-xs font-bold truncate ${
                      isDone
                        ? 'line-through text-slate-500 dark:text-slate-400'
                        : 'text-slate-800 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold mt-0.5">
                    <span style={{ color }}>{task.subject}</span>
                    <span>•</span>
                    <span className="font-mono text-brand-teal">{time12h}</span>
                    <span>•</span>
                    <span>{task.duration || 60}m</span>
                  </div>
                </div>
              </div>

              {/* Square Play Button */}
              <button
                onClick={() => handleStartTimer(task)}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-brand-teal/20 hover:bg-brand-teal text-brand-teal hover:text-white transition-all shadow-sm shrink-0 ml-2 active:scale-90"
                title="Start Pomodoro Timer"
              >
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
