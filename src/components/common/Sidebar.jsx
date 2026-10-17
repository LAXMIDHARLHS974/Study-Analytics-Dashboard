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
  Layers,
  X
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

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

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-56 sm:w-64 md:w-64 lg:w-72 
        bg-white/85 dark:bg-[#0c1424]/90 backdrop-blur-2xl text-slate-800 dark:text-slate-200 
        flex flex-col justify-between p-3 sm:p-4 shadow-[0_10px_35px_rgba(20,35,60,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)]
        transition-all duration-300 ease-in-out
        md:translate-x-0 md:static md:rounded-2xl md:my-3 md:ml-3
        border border-white/80 dark:border-white/10 select-none
        pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Top Profile Section */}
      <div className="relative flex flex-col items-center pt-1 sm:pt-2 pb-3 sm:pb-4 border-b border-slate-200/80 dark:border-slate-800">
        {/* Mobile close button */}
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="md:hidden absolute top-0 right-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative group cursor-pointer">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl p-0.5 sm:p-1 bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-500 shadow-md">
            <img
              src={userAvatar || '/assets/student_avatar.jpg'}
              alt={userName}
              className="w-full h-full object-cover rounded-xl ring-2 ring-white dark:ring-slate-900 shadow-inner"
            />
          </div>
        </div>

        <h2 className="mt-2 sm:mt-3 text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-1.5">
          <span>Hi, {userName}!</span>
          <span className="text-amber-500 dark:text-violet-400 text-xs sm:text-sm">✨</span>
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[170px] sm:max-w-[220px]">
          {userMotto || 'Stay Focused & Consistent'}
        </p>
      </div>

      {/* Navigation List with High-Contrast Liquid Glass States */}
      <nav className="flex-1 overflow-y-auto py-2.5 sm:py-3 space-y-1 sm:space-y-1.5 pr-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose && onClose()}
              className={({ isActive }) => `
                ${item.hideOnMobile ? 'hidden md:flex' : 'flex'} items-center gap-2.5 sm:gap-3.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-[0_4px_16px_rgba(37,99,235,0.35)]'
                  : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10 font-semibold'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-colors ${isActive
                      ? 'bg-white/20 text-white'
                      : 'text-slate-400 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-white'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="flex-1 truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
