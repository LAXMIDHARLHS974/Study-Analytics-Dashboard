import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Plus, 
  Sun, 
  Moon, 
  Menu, 
  Timer, 
  AlertCircle, 
  Check, 
  ArrowRight,
  Flame,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTaskStore } from '../../store/useTaskStore';
import { isBefore, parseISO, startOfDay, format } from 'date-fns';
import { formatTo12Hour } from '../../utils/timeFormat';

export default function TopBar({ onOpenSidebar, onOpenNewTask }) {
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const { theme, toggleTheme, userName, userAvatar, isTimerRunning, timerSecondsLeft } = useSettingsStore();
  const { searchQuery, setSearchQuery, tasks, carryForwardOverdueTasks } = useTaskStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Compute overdue and due today tasks
  const today = startOfDay(new Date());
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'Done') return false;
    try {
      return isBefore(parseISO(t.date), today);
    } catch {
      return false;
    }
  });

  const dueTodayTasks = tasks.filter((t) => t.date === format(new Date(), 'yyyy-MM-dd') && t.status !== 'Done');

  // Page title mapping
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/today': return "Today's Schedule & Timeline";
      case '/week': return 'Weekly Study Plan';
      case '/month': return 'Monthly Calendar';
      case '/year': return 'Yearly Roadmaps & Milestones';
      case '/routine': return 'Daily Routine Builder';
      case '/subjects': return 'Subjects & Syllabus Tracker';
      case '/goals': return 'Academic & Long-term Goals';
      case '/timer': return 'Pomodoro Study Timer';
      case '/analytics': return 'Analytics & Study Heatmap';
      case '/settings': return 'App Settings & Backup';
      default: return 'BUILD LHS';
    }
  };

  // Keyboard shortcut: Pressing '/' focuses search, 'N' opens new task
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onOpenNewTask();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenNewTask]);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimerMinSec = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="px-4 lg:px-8 pt-4 pb-3 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          aria-label="Toggle Navigation Menu"
          className="md:hidden p-2.5 rounded-2xl bg-white/70 dark:bg-slate-800/80 shadow-md border border-white/50 dark:border-slate-700/60 active:scale-95 transition-all text-slate-700 dark:text-slate-200"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight embossed-title text-slate-800 dark:text-white">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">
            {format(new Date(), 'EEEE, MMMM do, yyyy')} • Let's keep building!
          </p>
        </div>
      </div>

      {/* Center & Right Action Items */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Neumorphic Search Bar */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, subjects... [ / ]"
            className="w-full pl-9 pr-8 py-2 text-xs lg:text-sm font-medium rounded-full neu-inset border border-white/50 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-500/80 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Pomodoro Pill */}
        <button
          onClick={() => navigate('/timer')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md ${
            isTimerRunning
              ? 'bg-gradient-to-r from-brand-teal to-emerald-500 text-white animate-pulse'
              : 'neu-pill-btn text-slate-700 dark:text-slate-200'
          }`}
          title="Open Focus Timer"
        >
          <Timer className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isTimerRunning ? formatTimerMinSec(timerSecondsLeft) : '25m Focus'}
          </span>
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            className="p-2.5 rounded-full neu-pill-btn relative text-slate-700 dark:text-slate-200 hover:text-brand-teal"
          >
            <Bell className="w-4 h-4" />
            {overdueTasks.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-coral text-white text-[10px] font-bold flex items-center justify-center animate-bounce shadow">
                {overdueTasks.length}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 clay-card p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-300/40 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-teal" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Study Alerts</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal font-semibold">
                  {overdueTasks.length} overdue
                </span>
              </div>

              <div className="py-2 max-h-72 overflow-y-auto space-y-2">
                {overdueTasks.length > 0 && (
                  <div className="p-3 rounded-2xl bg-brand-coral/10 border border-brand-coral/30">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-brand-coral shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-brand-coral">
                          {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                          Tasks from previous days are still pending.
                        </p>
                        <button
                          onClick={() => {
                            carryForwardOverdueTasks();
                            setShowNotifications(false);
                          }}
                          className="mt-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-coral text-white shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
                        >
                          Carry forward to today <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 pt-1">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                    Due Today ({dueTodayTasks.length})
                  </h4>
                  {dueTodayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/80 dark:border-slate-700/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[200px]">
                          {task.title}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {formatTo12Hour(task.startTime)} • {task.subject}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          className="p-2.5 rounded-xl neu-pill-btn text-slate-700 dark:text-amber-300 hover:scale-105 active:scale-95 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 fill-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* "+ New Task" Button (Tactile Teal Square Button) */}
        <button
          onClick={onOpenNewTask}
          className="neu-teal-btn flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm shadow-lg font-bold rounded-xl"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Task</span>
          <span className="hidden lg:inline text-[10px] opacity-75 font-mono ml-0.5">[N]</span>
        </button>

        {/* Profile Avatar Pill in Topbar for Mobile */}
        <button 
          onClick={() => navigate('/settings')}
          className="w-9 h-9 rounded-full ring-2 ring-brand-teal/50 shadow overflow-hidden md:hidden active:scale-95 transition-all"
        >
          <img src={userAvatar || '/assets/student_avatar.jpg'} alt={userName} className="w-full h-full object-cover" />
        </button>
      </div>
    </header>
  );
}
