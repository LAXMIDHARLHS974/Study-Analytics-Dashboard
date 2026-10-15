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
  Crown,
  Layers,
  Flame,
  ListTodo
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
  { path: '/timer', label: 'Study Timer', icon: Timer },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { userName, userAvatar } = useSettingsStore();
  const { tasks } = useTaskStore();

  const pendingCount = tasks.filter((t) => t.status !== 'Done').length;

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[#202D42] text-slate-200 
        flex flex-col justify-between p-4 shadow-2xl transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:w-64 lg:w-72 md:rounded-r-2xl md:my-3 md:ml-3
        border-r border-slate-700/40 select-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Top Profile Section */}
      <div className="flex flex-col items-center pt-2 pb-4 border-b border-slate-700/50">
        <div className="relative group cursor-pointer">
          <div className="w-20 h-20 rounded-2xl p-1 bg-gradient-to-tr from-brand-teal/80 via-brand-blue/60 to-brand-purple/80 shadow-lg">
            <img
              src={userAvatar || '/assets/student_avatar.jpg'}
              alt={userName}
              className="w-full h-full object-cover rounded-xl ring-2 ring-slate-900 shadow-inner"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-brand-mint text-[10px] text-slate-950 font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-0.5">
            <Flame className="w-3 h-3 fill-amber-300 text-amber-500" />
            <span>7d</span>
          </div>
        </div>

        <h2 className="mt-3 text-lg font-bold text-white tracking-wide flex items-center gap-1.5">
          <span>Hi, {userName}!</span>
          <span className="text-brand-teal text-sm">✨</span>
        </h2>
        <p className="text-xs text-slate-400 font-medium">Ready for high focus</p>
      </div>

      {/* Navigation List with Neumorphic Active States */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-1.5 pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose && onClose()}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200
                ${
                  isActive
                    ? 'bg-gradient-to-r from-[#2F3F5B] to-[#394B6B] text-white shadow-sidebar-nav border-t border-slate-500/30 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-brand-teal/20 text-brand-teal'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {item.path === '/today' && pendingCount > 0 && (
                    <span className="px-2 py-0.5 text-[11px] rounded-full bg-brand-teal/20 text-brand-teal font-bold border border-brand-teal/30">
                      {pendingCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Pro Card (Matching Screenshot "Go Premium" Look) */}
      <div className="pt-2">
        <div className="rounded-2xl p-3.5 bg-gradient-to-b from-[#28374F] to-[#1C2739] border border-slate-700/60 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-brand-teal/10 rounded-full blur-xl group-hover:bg-brand-teal/20 transition-all"></div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shadow-inner">
              <Crown className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">BUILD LHS Pro</h4>
              <p className="text-[10px] text-slate-400">Offline & Deep Focus</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight mb-2.5">
            Full Pomodoro soundscapes, unlimited routines & cloud backup.
          </p>
          <NavLink
            to="/timer"
            className="w-full block text-center py-2 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-teal to-brand-blue text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            Start Focus Sprint ⏱️
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
