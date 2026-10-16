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
  const [showMobileSearch, setShowMobileSearch] = useState(false);
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
      case '/today': return "Today's Schedule";
      case '/week': return 'Weekly Study Plan';
      case '/month': return 'Monthly Calendar';
      case '/year': return 'Yearly Roadmaps';
      case '/routine': return 'Daily Routine';
      case '/subjects': return 'Subjects & Syllabus';
      case '/goals': return 'Academic Goals';
      case '/timer': return 'Pomodoro Timer';
      case '/analytics': return 'Study Analytics';
      case '/settings': return 'App Settings';
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
    <header className="px-3 sm:px-4 lg:px-8 pt-3 sm:pt-4 pb-2 sm:pb-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Menu & Page Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenSidebar}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-2 rounded-xl bg-[#0E1636]/80 backdrop-blur-md shadow-md border border-white/10 active:scale-95 transition-all text-slate-200 shrink-0"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-2xl lg:text-3xl font-extrabold tracking-tight embossed-title text-slate-800 dark:text-white truncate">
              {getPageTitle()}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block truncate">
              {format(new Date(), 'EEEE, MMMM do, yyyy')} • Let's keep building!
            </p>
          </div>
        </div>

        {/* Center & Right Action Items */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile search toggle button */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            aria-label="Toggle Search"
            className="md:hidden p-2 rounded-full neu-pill-btn text-slate-200"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Desktop Neumorphic Search Bar */}
          <div className="relative hidden md:block w-48 lg:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, subjects... [ / ]"
              className="w-full pl-9 pr-8 py-2 text-xs lg:text-sm font-medium rounded-full neu-inset border border-white/10 focus:outline-none focus:ring-2 focus:ring-royal-500/60 focus:border-royal-400/50 text-white placeholder:text-slate-400/70 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Pomodoro Pill (Desktop only - mobile has bottom bar Timer) */}
          <button
            onClick={() => navigate('/timer')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md ${
              isTimerRunning
                ? 'bg-gradient-to-r from-royal-600 to-violet-neon text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] animate-pulse'
                : 'neu-pill-btn text-slate-200'
            }`}
            title="Open Focus Timer"
          >
            <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">
              {isTimerRunning ? formatTimerMinSec(timerSecondsLeft) : '25m Focus'}
            </span>
          </button>

          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="View notifications"
              className="p-2 sm:p-2.5 rounded-full neu-pill-btn relative text-slate-200 hover:text-royal-400"
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
              <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto right-auto sm:right-0 top-16 sm:top-auto sm:mt-3 w-auto sm:w-96 max-w-sm clay-card p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-royal-400" />
                    <h3 className="text-sm font-bold text-white">Study Alerts</h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-royal-500/20 text-royal-300 border border-royal-500/30 font-semibold">
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
                        <div className="min-w-0 flex-1 mr-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                            {task.title}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {formatTo12Hour(task.startTime)} • {task.subject}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold shrink-0">
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
            className="p-2 sm:p-2.5 rounded-xl neu-pill-btn text-slate-700 dark:text-amber-300 hover:scale-105 active:scale-95 transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 fill-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* "+ New Task" Button (Desktop only - mobile has bottom center + button) */}
          <button
            onClick={onOpenNewTask}
            className="hidden md:flex neu-teal-btn items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm shadow-lg font-bold rounded-xl"
            title="Create Task"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Task</span>
            <span className="hidden lg:inline text-[10px] opacity-75 font-mono ml-0.5">[N]</span>
          </button>

          {/* Profile Avatar Pill in Topbar for Mobile */}
          <button 
            onClick={() => navigate('/settings')}
            aria-label="Open Settings"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-brand-teal/50 shadow overflow-hidden md:hidden active:scale-95 transition-all shrink-0"
          >
            <img src={userAvatar || '/assets/student_avatar.jpg'} alt={userName} className="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {showMobileSearch && (
        <div className="relative md:hidden w-full pt-1 pb-1 animate-in fade-in duration-150">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, subjects..."
            className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-full neu-inset border border-white/50 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-500/80"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </header>
  );
}
