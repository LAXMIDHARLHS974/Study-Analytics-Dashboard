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
  CheckCheck,
  ArrowRight
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTaskStore } from '../../store/useTaskStore';
import { isBefore, parseISO, startOfDay, format } from 'date-fns';
import { formatTo12Hour } from '../../utils/timeFormat';

export default function TopBar({ onOpenSidebar, onOpenNewTask }) {
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const { theme, toggleTheme, userName, userAvatar, isTimerRunning, timerSecondsLeft, readNotificationIds, markAllNotificationsAsRead } = useSettingsStore();
  const { searchQuery, setSearchQuery, tasks } = useTaskStore();

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

  const unreadOverdueTasks = overdueTasks.filter(
    (t) => !(readNotificationIds || []).includes(t.id)
  );
  const unreadCount = unreadOverdueTasks.length;

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
            className="md:hidden p-2 rounded-xl neu-pill-btn active:scale-95 transition-all text-slate-700 dark:text-slate-200 shrink-0"
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
              className="w-full pl-9 pr-8 py-2 text-xs lg:text-sm font-semibold rounded-full neu-inset border border-slate-300/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-royal-500/60 focus:border-royal-400/50 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400/70 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Pomodoro Pill (Desktop only - mobile has bottom bar Timer) */}
          <button
            onClick={() => navigate('/timer')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md ${isTimerRunning
                ? 'bg-gradient-to-r from-royal-600 to-violet-neon text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] animate-pulse'
                : 'neu-pill-btn text-slate-800 dark:text-slate-100 hover:text-royal-600 dark:hover:text-royal-300'
              }`}
            title="Open Focus Timer"
          >
            <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-royal-600 dark:text-royal-400" />
            <span className="hidden sm:inline">
              {isTimerRunning ? formatTimerMinSec(timerSecondsLeft) : '25m Focus'}
            </span>
          </button>

          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="View notifications"
              className={`p-2 sm:p-2.5 rounded-full neu-pill-btn relative transition-all ${
                showNotifications
                  ? 'text-royal-600 dark:text-royal-300 ring-2 ring-royal-500/50 bg-royal-50 dark:bg-royal-950/40'
                  : 'text-slate-700 dark:text-slate-200 hover:text-royal-600 dark:hover:text-royal-400'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-coral text-white text-[10px] font-bold flex items-center justify-center animate-bounce shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Flyout */}
            {showNotifications && (
              <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto right-auto sm:right-0 top-16 sm:top-auto sm:mt-2.5 w-auto sm:w-[380px] max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.25),0_0_0_1px_rgba(15,23,42,0.06)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)] p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-royal-50 dark:bg-royal-950/70 border border-royal-200/60 dark:border-royal-800/60 flex items-center justify-center text-royal-600 dark:text-royal-400 shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        Study Alerts
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {unreadCount > 0
                          ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}`
                          : 'Everything is up to date'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {unreadCount > 0 ? (
                      <button
                        onClick={() => {
                          const idsToMark = overdueTasks.map((t) => t.id);
                          markAllNotificationsAsRead(idsToMark);
                        }}
                        className="text-[11px] font-bold text-royal-600 hover:text-royal-700 dark:text-royal-300 dark:hover:text-royal-200 bg-royal-50 hover:bg-royal-100 dark:bg-royal-950/60 dark:hover:bg-royal-900/60 border border-royal-200/70 dark:border-royal-800/70 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm"
                        title="Mark all notifications as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-royal-600 dark:text-royal-400" />
                        <span>Mark all read</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center gap-1 px-2.5 py-1 rounded-lg">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        <span>All caught up</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Notifications Scroll Body */}
                <div className="py-2.5 max-h-[340px] overflow-y-auto space-y-3 pr-0.5 custom-scrollbar">
                  {/* Unread Overdue Alert Card */}
                  {unreadOverdueTasks.length > 0 ? (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/90 dark:border-rose-900/60 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                              {unreadOverdueTasks.length} Overdue Task{unreadOverdueTasks.length > 1 ? 's' : ''}
                            </h4>
                            <p className="text-[11px] text-rose-700 dark:text-rose-300/90 mt-0.5">
                              Tasks from previous days are pending.
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200/80 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 uppercase tracking-wider shrink-0">
                          Attention
                        </span>
                      </div>

                      {/* Overdue Task Mini List */}
                      <div className="space-y-1.5 pt-1">
                        {unreadOverdueTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            onClick={() => {
                              setShowNotifications(false);
                              navigate('/today');
                            }}
                            className="p-2 rounded-lg bg-white dark:bg-slate-900/90 border border-rose-200/70 dark:border-rose-900/50 flex items-center justify-between text-xs hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-sm cursor-pointer transition-all"
                          >
                            <div className="min-w-0 flex-1 mr-2">
                              <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">
                                {task.title}
                              </span>
                              <span className="text-[10px] text-rose-600 dark:text-rose-400 block truncate font-medium">
                                Scheduled {task.date} • {task.subject || 'General'}
                              </span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold shrink-0">
                              {task.priority || 'High'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : overdueTasks.length > 0 ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                      <span>All overdue alerts marked as read</span>
                    </div>
                  ) : null}

                  {/* Due Today Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-0.5">
                      <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Due Today ({dueTodayTasks.length})
                      </h4>
                      {dueTodayTasks.length > 0 && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          Active schedule
                        </span>
                      )}
                    </div>

                    {dueTodayTasks.length === 0 ? (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-center">
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          No tasks due today 🎉
                        </p>
                      </div>
                    ) : (
                      dueTodayTasks.slice(0, 4).map((task) => {
                        const priorityStyle =
                          task.priority === 'High'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-900/50'
                            : task.priority === 'Medium'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-900/50'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-900/50';

                        return (
                          <div
                            key={task.id}
                            onClick={() => {
                              setShowNotifications(false);
                              navigate('/today');
                            }}
                            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs cursor-pointer transition-all group shadow-sm hover:shadow"
                          >
                            <div className="min-w-0 flex-1 mr-2">
                              <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate group-hover:text-royal-600 dark:group-hover:text-royal-400 transition-colors">
                                {task.title}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                                {formatTo12Hour(task.startTime)} • {task.subject || 'General'}
                              </span>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold shrink-0 ${priorityStyle}`}>
                              {task.priority || 'Normal'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Empty state when completely free */}
                  {unreadOverdueTasks.length === 0 && overdueTasks.length === 0 && dueTodayTasks.length === 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-center space-y-1.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">All caught up!</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        No overdue alerts or pending tasks for today.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-2.5 mt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/today');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-semibold text-xs text-center transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  >
                    <span>View Today's Schedule</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
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
