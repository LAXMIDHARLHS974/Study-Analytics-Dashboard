import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Clock, 
  Play, 
  MoreVertical, 
  Edit3, 
  Copy, 
  Trash2, 
  Calendar 
} from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { soundManager } from '../../utils/audio';
import { triggerConfetti } from '../../utils/confetti';
import { formatTo12Hour } from '../../utils/timeFormat';

export default function TaskItem({ task, onEdit, variant = 'row' }) {
  const navigate = useNavigate();
  const { toggleTaskStatus, deleteTask, duplicateTask, subjects } = useTaskStore();
  const { setTimerState } = useSettingsStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const subjectObj = subjects.find((s) => s.id === task.subjectId || s.name === task.subject);
  const subjectColor = subjectObj ? subjectObj.color : '#5FB3B3';

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleToggle = (e) => {
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

  const handleStartTimer = (e) => {
    e.stopPropagation();
    setTimerState({
      activeTaskId: task.id,
      activeSubject: task.subject,
      timerSecondsLeft: (task.duration || 25) * 60,
      isTimerRunning: true,
      timerMode: 'work',
    });
    navigate('/timer');
  };

  const isDone = task.status === 'Done';
  const formattedTime = formatTo12Hour(task.startTime || '10:00');

  // SQUARE TYPE CARD LAYOUT (Ideal for Column Boards, Week View, Calendar Grid)
  if (variant === 'square') {
    return (
      <div
        className={`group relative p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md ${
          isDone
            ? 'bg-slate-200/30 dark:bg-slate-900/40 border-slate-300/30 dark:border-slate-800/60 opacity-65'
            : 'bg-white/70 dark:bg-slate-800/80 hover:bg-white/95 dark:hover:bg-slate-800 border-white/80 dark:border-slate-700/70'
        }`}
      >
        {/* Top: Subject badge & Menu */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-md truncate max-w-[100px]"
            style={{
              backgroundColor: `${subjectColor}20`,
              color: subjectColor,
              border: `1px solid ${subjectColor}40`,
            }}
          >
            {task.subject}
          </span>

          <div className="flex items-center gap-1">
            {task.priority === 'High' && (
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-brand-coral/20 text-brand-coral border border-brand-coral/40">
                High
              </span>
            )}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="w-6 h-6 rounded-md hover:bg-slate-300/40 dark:hover:bg-slate-700/60 flex items-center justify-center text-slate-400 hover:text-slate-200"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-7 w-32 py-1 rounded-xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 z-50 text-xs font-semibold animate-in fade-in">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(task);
                    }}
                    className="w-full px-2.5 py-1.5 text-left flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      duplicateTask(task.id);
                    }}
                    className="w-full px-2.5 py-1.5 text-left flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    <Copy className="w-3 h-3" /> Duplicate
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      deleteTask(task.id);
                    }}
                    className="w-full px-2.5 py-1.5 text-left flex items-center gap-1.5 text-brand-coral hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Full Task Title */}
        <h4
          className={`text-xs font-bold leading-snug line-clamp-2 my-1 text-left ${
            isDone
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-800 dark:text-slate-100'
          }`}
          title={task.title}
        >
          {task.title}
        </h4>

        {/* Bottom: 12-Hour Time & Action Buttons */}
        <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            <Clock className="w-3 h-3 text-brand-teal shrink-0" />
            <span className="whitespace-nowrap">{formattedTime}</span>
            <span className="opacity-75">({task.duration || 60}m)</span>
          </div>

          <div className="flex items-center gap-1">
            {!isDone && (
              <button
                onClick={handleStartTimer}
                title="Start Focus Timer"
                className="w-6 h-6 rounded-md bg-brand-teal/20 hover:bg-brand-teal text-brand-teal hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
              >
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </button>
            )}

            {/* Square tactile checkbox */}
            <button
              type="button"
              onClick={handleToggle}
              className={`w-6 h-6 rounded-md flex items-center justify-center transition-all shrink-0 ${
                isDone
                  ? 'bg-brand-mint text-white shadow-inner'
                  : 'border-2 border-slate-400/80 hover:border-brand-teal bg-white/70 dark:bg-slate-700/50 hover:scale-105 active:scale-90'
              }`}
              aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
            >
              {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD ROW LAYOUT (with 12h time and square buttons)
  return (
    <div
      className={`group relative flex items-center justify-between p-3 rounded-xl transition-all duration-200 border ${
        isDone
          ? 'bg-slate-200/40 dark:bg-slate-900/30 border-slate-300/40 dark:border-slate-800/60 opacity-60'
          : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-800/90 border-white/80 dark:border-slate-700/60 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Left: Square Checkbox & Task details */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={handleToggle}
          className={`w-6 h-6 rounded-md flex items-center justify-center transition-all shrink-0 ${
            isDone
              ? 'bg-brand-mint text-white shadow-inner scale-95'
              : 'border-2 border-slate-400/80 hover:border-brand-teal hover:scale-105 active:scale-90 bg-white/70 dark:bg-slate-700/50'
          }`}
          aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs sm:text-sm font-semibold truncate ${
                isDone
                  ? 'line-through text-slate-500 dark:text-slate-400'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {task.title}
            </span>

            {/* Subject badge (square rounded-md) */}
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: `${subjectColor}20`,
                color: subjectColor,
                border: `1px solid ${subjectColor}40`,
              }}
            >
              {task.subject}
            </span>

            {task.priority === 'High' && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-coral/15 text-brand-coral border border-brand-coral/30">
                High
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-brand-teal" />
              {formattedTime} ({task.duration || 60}m)
            </span>
            {task.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {task.date}
              </span>
            )}
            {task.description && (
              <span className="truncate max-w-[200px] hidden md:inline opacity-80">
                • {task.description}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Quick Play Timer & Options menu */}
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        {!isDone && (
          <button
            onClick={handleStartTimer}
            title="Start Focus Timer on this task"
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-teal/20 hover:bg-brand-teal text-brand-teal hover:text-white transition-all shadow-sm active:scale-90"
          >
            <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
          </button>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-lg hover:bg-slate-300/40 dark:hover:bg-slate-700/60 flex items-center justify-center text-slate-500 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 w-36 py-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 z-30 text-xs font-semibold animate-in fade-in duration-150">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  duplicateTask(task.id);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
              >
                <Copy className="w-3.5 h-3.5" /> Duplicate
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  deleteTask(task.id);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 text-brand-coral hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
