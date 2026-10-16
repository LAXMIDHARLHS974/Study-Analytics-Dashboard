import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  CalendarRange,
  Target,
  BookMarked,
  BarChart3,
  Settings,
  Timer,
  Sparkles,
  Layers,
  Flame,
  ListTodo,
  X
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTaskStore } from '../../store/useTaskStore';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/today', label: 'Today', icon: Clock },
  { path: '/week', label: 'Weekly Plan', icon: CalendarDays },
  { path: '/month', label: 'Monthly Plan', icon: CalendarRange },
  { path: '/year', label: 'Yearly Plan', icon: Target },
  { path: '/routine', label: 'Daily Routine', icon: Layers },
  { path: '/subjects', label: 'Subjects', icon: BookMarked },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/timer', label: 'Study Timer', icon: Timer, hideOnMobile: true },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, hideOnMobile: true },
  { path: '/settings', label: 'Settings', icon: Settings, hideOnMobile: true },
];

export default function Sidebar({ isOpen, onClose }) {
  const { userName, userAvatar, userMotto } = useSettingsStore();
  const { tasks } = useTaskStore();

  const pendingCount = tasks.filter((t) => t.status !== 'Done').length;

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-72 
        bg-[#162234]/85 dark:bg-[#0c1424]/85 backdrop-blur-2xl text-slate-200 
        flex flex-col justify-between p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] 
        transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:w-64 lg:w-72 md:rounded-2xl md:my-3 md:ml-3
        border border-white/20 dark:border-white/10 select-none
        pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))]
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Top Profile Section */}
      <div className="relative flex flex-col items-center pt-2 pb-4 border-b border-white/15 dark:border-slate-800">
        {/* Mobile close button */}
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="md:hidden absolute top-0 right-0 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative group cursor-pointer">
          <div className="w-20 h-20 rounded-2xl p-1 bg-gradient-to-tr from-brand-teal/80 via-brand-blue/60 to-brand-purple/80 shadow-lg">
            <img
              src={userAvatar || '/assets/student_avatar.jpg'}
              alt={userName}
              className="w-full h-full object-cover rounded-xl ring-2 ring-slate-900/50 shadow-inner"
            />
          </div>
        </div>

        <h2 className="mt-3 text-lg font-bold text-white tracking-wide flex items-center gap-1.5">
          <span>Hi, {userName}!</span>
          <span className="text-brand-teal text-sm">✨</span>
        </h2>
        <p className="text-xs text-slate-400 font-medium truncate max-w-[220px]">
          {userMotto || 'Stay Focused & Consistent'}
        </p>
      </div>

      {/* Navigation List with Liquid Glass Active States */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-1.5 pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose && onClose()}
              className={({ isActive }) => `
                ${item.hideOnMobile ? 'hidden md:flex' : 'flex'} items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${isActive
                  ? 'bg-brand-teal/25 text-white border border-brand-teal/40 shadow-[0_4px_16px_rgba(95,179,179,0.35)] backdrop-blur-md font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/10 dark:hover:bg-white/5'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${isActive
                      ? 'bg-brand-teal/30 text-brand-teal'
                      : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {item.path === '/today' && pendingCount > 0 && (
                    <span className="px-2 py-0.5 text-[11px] rounded-full bg-brand-teal/25 text-brand-teal font-bold border border-brand-teal/30">
                      {pendingCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
