import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  CheckCircle2,
  CloudRain,
  Wind,
  Sparkles
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTaskStore } from '../store/useTaskStore';
import { soundManager } from '../utils/audio';
import { triggerBigMilestone } from '../utils/confetti';
import { sendNotification } from '../utils/notifications';

export default function TimerPage() {
  const { 
    workDuration, 
    shortBreakDuration, 
    longBreakDuration, 
    ambientSound, 
    updateTimerSettings,
    isTimerRunning,
    timerSecondsLeft,
    timerMode,
    activeTaskId,
    activeSubject,
    completedSessionsCount,
    setTimerState,
  } = useSettingsStore();

  const { tasks, subjects, logStudySession, toggleTaskStatus } = useTaskStore();
  const [volume, setVolume] = useState(0.25);
  const [activeSound, setActiveSound] = useState(ambientSound || 'none');

  const timerRef = useRef(null);

  // Get active task
  const currentTask = tasks.find((t) => t.id === activeTaskId);

  // Ensure activeSubject always matches a genuine registered subject
  useEffect(() => {
    if (subjects.length > 0) {
      const match = subjects.find(
        (s) => s.name.toLowerCase() === (activeSubject || '').trim().toLowerCase()
      );
      if (match) {
        if (activeSubject !== match.name) {
          setTimerState({ activeSubject: match.name });
        }
      } else {
        setTimerState({ activeSubject: subjects[0].name });
      }
    }
  }, [subjects, activeSubject, setTimerState]);

  // Total seconds for current mode
  const getTotalSecondsForMode = (mode) => {
    switch (mode) {
      case 'shortBreak': return shortBreakDuration * 60;
      case 'longBreak': return longBreakDuration * 60;
      default: return workDuration * 60;
    }
  };

  const totalModeSeconds = getTotalSecondsForMode(timerMode);

  // Interval timer tick
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerState({
          timerSecondsLeft: Math.max(0, timerSecondsLeft - 1),
        });

        if (timerSecondsLeft <= 1) {
          handleSessionComplete();
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timerSecondsLeft]);

  // Handle session completion
  const handleSessionComplete = () => {
    soundManager.playBell();
    triggerBigMilestone();

    if (timerMode === 'work') {
      const effectiveSubject =
        activeSubject ||
        currentTask?.subject ||
        (subjects.length > 0 ? subjects[0].name : 'General');

      // Log session
      logStudySession({
        subjectName: effectiveSubject,
        durationMinutes: workDuration,
        taskId: activeTaskId,
      });

      sendNotification('Focus Sprint Completed! 🎉', {
        body: `Great job! You completed a ${workDuration}m study sprint on ${effectiveSubject}. Take a break!`,
      });

      const nextCompletedCount = completedSessionsCount + 1;
      const nextMode = nextCompletedCount % 4 === 0 ? 'longBreak' : 'shortBreak';
      
      setTimerState({
        isTimerRunning: false,
        timerMode: nextMode,
        completedSessionsCount: nextCompletedCount,
        timerSecondsLeft: getTotalSecondsForMode(nextMode),
      });
    } else {
      sendNotification('Break Over! ⚡', {
        body: 'Ready to dive back into deep work?',
      });
      setTimerState({
        isTimerRunning: false,
        timerMode: 'work',
        timerSecondsLeft: workDuration * 60,
      });
    }
  };

  const toggleTimer = () => {
    const nextRunning = !isTimerRunning;
    setTimerState({ isTimerRunning: nextRunning });

    if (nextRunning && activeSound !== 'none') {
      soundManager.setAmbient(activeSound, volume);
    } else if (!nextRunning) {
      soundManager.setAmbient('none');
    }
  };

  const resetTimer = () => {
    setTimerState({
      isTimerRunning: false,
      timerSecondsLeft: getTotalSecondsForMode(timerMode),
    });
    soundManager.setAmbient('none');
  };

  const switchMode = (mode) => {
    setTimerState({
      timerMode: mode,
      isTimerRunning: false,
      timerSecondsLeft: getTotalSecondsForMode(mode),
    });
    soundManager.setAmbient('none');
  };

  const handleAmbientChange = (type) => {
    setActiveSound(type);
    updateTimerSettings({ ambientSound: type });
    if (isTimerRunning) {
      soundManager.setAmbient(type, volume);
    }
  };

  const progressPct = Math.min(100, Math.max(0, ((totalModeSeconds - timerSecondsLeft) / totalModeSeconds) * 100));

  const minutes = Math.floor(timerSecondsLeft / 60);
  const seconds = timerSecondsLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="clay-card p-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
          Pomodoro Study Sprint
        </h2>
      </div>

      {/* Main Timer Dial Card */}
      <div className="clay-card p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-2xl sm:rounded-full neu-inset mb-6 sm:mb-8 max-w-full">
          <button
            onClick={() => switchMode('work')}
            className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-bold transition-all ${
              timerMode === 'work'
                ? 'neu-teal-btn shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Study Focus ({workDuration}m)
          </button>
          <button
            onClick={() => switchMode('shortBreak')}
            className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-bold transition-all ${
              timerMode === 'shortBreak'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Short Break ({shortBreakDuration}m)
          </button>
          <button
            onClick={() => switchMode('longBreak')}
            className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-bold transition-all ${
              timerMode === 'longBreak'
                ? 'bg-brand-purple text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Long Break ({longBreakDuration}m)
          </button>
        </div>

        {/* Circular Progress & Clock */}
        <div className="relative w-52 h-52 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-slate-200/80 dark:stroke-slate-800"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress animated ring */}
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              stroke={timerMode === 'work' ? '#5FB3B3' : timerMode === 'shortBreak' ? '#6A9AC4' : '#7B7FBF'}
              strokeWidth="10"
              strokeDasharray="276"
              strokeDashoffset={276 - (276 * progressPct) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-linear"
              style={{ filter: 'drop-shadow(0px 4px 8px rgba(95, 179, 179, 0.4))' }}
            />
          </svg>

          {/* Center Digital Clock */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-6xl font-black text-slate-800 dark:text-white tracking-tight font-mono">
              {timeFormatted}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 sm:mt-2">
              {timerMode === 'work' ? activeSubject : 'Break Time'}
            </span>
          </div>
        </div>

        {/* Controls: Play/Pause, Reset, Skip */}
        <div className="flex items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
          <button
            onClick={resetTimer}
            className="p-3 sm:p-3.5 rounded-full neu-pill-btn text-slate-600 dark:text-slate-300 hover:text-slate-900 active:scale-95 transition-all shadow"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-6 sm:px-8 py-3 sm:py-3.5 rounded-full flex items-center gap-2 text-sm sm:text-base font-bold shadow-xl transition-all active:scale-95 ${
              isTimerRunning
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'neu-teal-btn'
            }`}
          >
            {isTimerRunning ? (
              <>
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={handleSessionComplete}
            className="p-3 sm:p-3.5 rounded-full neu-pill-btn text-slate-600 dark:text-slate-300 hover:text-slate-900 active:scale-95 transition-all shadow"
            title="Complete / Skip"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Sessions Completed Counter */}
        <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
          <span>Sessions completed today:</span>
          <span className="font-extrabold text-brand-teal">{completedSessionsCount}</span>
        </div>
      </div>

      {/* Task & Subject Selector + Ambient Soundscape Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Linked Task & Subject */}
        <div className="clay-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-teal" />
            <span>Target Subject & Task</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Subject</label>
            {subjects.length > 0 ? (
              <select
                value={activeSubject}
                onChange={(e) => setTimerState({ activeSubject: e.target.value })}
                className="w-full px-3 py-2 rounded-xl neu-inset text-xs font-bold text-slate-800 dark:text-white border border-white/60 dark:border-slate-700"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name} className="bg-slate-800 text-white">
                    {s.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Enter subject name (e.g. DSA, English, Backend)"
                value={activeSubject || ''}
                onChange={(e) => setTimerState({ activeSubject: e.target.value })}
                className="w-full px-3 py-2 rounded-xl neu-inset text-xs font-bold text-slate-800 dark:text-white border border-white/60 dark:border-slate-700 focus:outline-none"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Link to Task</label>
            <select
              value={activeTaskId || ''}
              onChange={(e) => {
                const selected = tasks.find((t) => t.id === e.target.value);
                setTimerState({
                  activeTaskId: e.target.value || null,
                  activeSubject: selected ? selected.subject : activeSubject,
                });
              }}
              className="w-full px-3 py-2 rounded-xl neu-inset text-xs font-semibold text-slate-800 dark:text-white border border-white/60 dark:border-slate-700"
            >
              <option value="" className="bg-slate-800 text-white">None (Free Focus Session)</option>
              {tasks.filter((t) => t.status !== 'Done').map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-800 text-white">
                  {t.title} ({t.duration}m)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ambient Soundscapes */}
        <div className="clay-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-brand-blue" />
            <span>Ambient Focus Soundscape</span>
          </h3>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleAmbientChange('none')}
              className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                activeSound === 'none'
                  ? 'neu-teal-btn text-white'
                  : 'neu-pill-btn text-slate-600 dark:text-slate-300'
              }`}
            >
              <VolumeX className="w-4 h-4" />
              <span>Mute</span>
            </button>

            <button
              onClick={() => handleAmbientChange('rain')}
              className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                activeSound === 'rain'
                  ? 'neu-teal-btn text-white'
                  : 'neu-pill-btn text-slate-600 dark:text-slate-300'
              }`}
            >
              <CloudRain className="w-4 h-4" />
              <span>Gentle Rain</span>
            </button>

            <button
              onClick={() => handleAmbientChange('whitenoise')}
              className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                activeSound === 'whitenoise'
                  ? 'neu-teal-btn text-white'
                  : 'neu-pill-btn text-slate-600 dark:text-slate-300'
              }`}
            >
              <Wind className="w-4 h-4" />
              <span>White Noise</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
