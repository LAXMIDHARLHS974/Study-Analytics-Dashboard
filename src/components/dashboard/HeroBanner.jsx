import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, Flame, Clock, BookOpen } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTaskStore } from '../../store/useTaskStore';
import { calculateStreak } from '../../utils/studyStats';

export default function HeroBanner() {
  const navigate = useNavigate();
  const { userName, setTimerState } = useSettingsStore();
  const { tasks, timerLogs } = useTaskStore();

  const { currentStreak, studiedToday } = calculateStreak(timerLogs, tasks);

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const pendingTasks = tasks.filter((t) => t.status !== 'Done');
  const nextTask = pendingTasks[0] || tasks[0];

  const handleStartStudying = () => {
    if (nextTask) {
      setTimerState({
        activeTaskId: nextTask.id,
        activeSubject: nextTask.subject,
        timerSecondsLeft: (nextTask.duration || 25) * 60,
        isTimerRunning: true,
        timerMode: 'work',
      });
    } else {
      setTimerState({
        activeTaskId: null,
        activeSubject: 'General Study',
        timerSecondsLeft: 25 * 60,
        isTimerRunning: true,
        timerMode: 'work',
      });
    }
    navigate('/timer');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl clay-card p-4 sm:p-6 shadow-neu-card border border-white/60 dark:border-slate-700/60 transition-all">
      {/* Background soft ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/10 via-transparent to-brand-blue/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: 3D Character Shelf Illustration matching the screenshot */}
        <div className="relative w-full md:w-5/12 max-w-sm rounded-xl overflow-hidden shadow-md group">
          <img
            src="/assets/student_shelf_hero.jpg"
            alt="Student studying with headphones"
            className="w-full h-44 sm:h-52 object-cover rounded-xl group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute top-2.5 left-2.5 bg-slate-950/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow">
            <Sparkles className="w-3 h-3 text-brand-teal" />
            <span>BUILD LHS Focus</span>
          </div>
        </div>

        {/* Right: Content details */}
        <div className="flex-1 w-full text-center md:text-left space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-teal/15 text-brand-teal text-xs font-bold border border-brand-teal/30">
            <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>
              {currentStreak}-Day Study Streak {studiedToday ? 'Active 🔥' : currentStreak > 0 ? 'On Track ⚡' : 'Start Today ✨'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {getGreeting()}, {userName}!
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
            {nextTask ? (
              <>
                Next up: <span className="font-bold text-brand-teal">{nextTask.title}</span> ({nextTask.duration}m). Ready to enter deep work?
              </>
            ) : (
              'Ready to build high focus? Add your subjects and tasks or start a study sprint!'
            )}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={handleStartStudying}
              className="neu-teal-btn flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold shadow-lg"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Studying</span>
            </button>

            <button
              onClick={() => navigate('/today')}
              className="neu-pill-btn flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200"
            >
              <Clock className="w-4 h-4 text-brand-blue" />
              <span>View Timeline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
