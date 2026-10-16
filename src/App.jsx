import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import TopBar from './components/common/TopBar';
import TaskModal from './components/tasks/TaskModal';

// Pages
import Dashboard from './pages/Dashboard';
import Today from './pages/Today';
import WeekPlan from './pages/WeekPlan';
import MonthPlan from './pages/MonthPlan';
import YearPlan from './pages/YearPlan';
import DailyRoutine from './pages/DailyRoutine';
import Subjects from './pages/Subjects';
import Goals from './pages/Goals';
import TimerPage from './pages/TimerPage';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

import { Home, Compass, BarChart3, Timer, User } from 'lucide-react';
import { useTaskStore } from './store/useTaskStore';
import { useSettingsStore } from './store/useSettingsStore';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const recordDailyVisit = useTaskStore((state) => state.recordDailyVisit);
  const theme = useSettingsStore((state) => state.theme);

  // Synchronize theme with document root classList
  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Automatically record daily visit whenever the user opens/visits the website
  React.useEffect(() => {
    if (typeof recordDailyVisit === 'function') {
      recordDailyVisit();
    }
  }, [recordDailyVisit]);

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  return (
    <BrowserRouter>
      <div className="relative min-h-screen bg-gradient-to-br from-[#dce7f2] via-[#eaf1f8] to-[#d8e5f2] dark:from-[#0b101c] dark:via-[#0e1627] dark:to-[#080d18] text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-500 overflow-x-hidden">
        {/* Liquid Ambient Glowing Mesh Orbs (Fixed in background for realistic glass refraction) */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 sm:w-[540px] sm:h-[540px] rounded-full bg-brand-teal/20 dark:bg-brand-teal/15 blur-[120px] sm:blur-[150px] animate-pulse" />
          <div className="absolute top-[20%] -right-32 w-96 h-96 sm:w-[600px] sm:h-[600px] rounded-full bg-brand-purple/20 dark:bg-brand-purple/15 blur-[130px] sm:blur-[160px]" />
          <div className="absolute -bottom-32 left-[15%] w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full bg-brand-coral/15 dark:bg-brand-coral/10 blur-[120px] sm:blur-[140px]" />
          <div className="absolute top-[65%] right-[20%] w-80 h-80 sm:w-[450px] sm:h-[450px] rounded-full bg-brand-mint/15 dark:bg-brand-mint/10 blur-[110px] sm:blur-[130px]" />
        </div>

        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-md md:hidden animate-in fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 1. Left Sidebar (Liquid Glass) */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* 2. Main Content Area */}
        <div className="relative z-10 flex-1 flex flex-col min-w-0 min-h-screen min-h-[100dvh] pb-32 md:pb-6">
          {/* Top Bar */}
          <TopBar
            onOpenSidebar={() => setSidebarOpen(true)}
            onOpenNewTask={handleOpenNewTask}
          />

          {/* Route Content View */}
          <main className="flex-1 px-3 sm:px-4 lg:px-8 py-3 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard onOpenNewTask={handleOpenNewTask} />} />
              <Route
                path="/today"
                element={<Today onOpenNewTask={handleOpenNewTask} onEditTask={handleEditTask} />}
              />
              <Route
                path="/week"
                element={<WeekPlan onOpenNewTask={handleOpenNewTask} onEditTask={handleEditTask} />}
              />
              <Route
                path="/month"
                element={<MonthPlan onOpenNewTask={handleOpenNewTask} onEditTask={handleEditTask} />}
              />
              <Route path="/year" element={<YearPlan />} />
              <Route path="/routine" element={<DailyRoutine />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/timer" element={<TimerPage />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>

        {/* 3. Floating Curved Transparent Liquid Glass Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] max-w-md mx-auto z-40 select-none">
          <nav
            aria-label="Mobile Navigation"
            className="
              relative
              bg-white/30 dark:bg-[#070B19]/40 
              backdrop-blur-2xl backdrop-saturate-[190%] 
              border border-white/60 dark:border-white/20 
              rounded-[28px] 
              p-1.5 
              flex items-center justify-between gap-1
              shadow-[0_16px_36px_-6px_rgba(15,23,42,0.18),0_0_20px_-2px_rgba(139,92,246,0.25),inset_0_1.5px_2px_rgba(255,255,255,0.7),inset_0_-1px_2px_rgba(0,0,0,0.08)]
              dark:shadow-[0_20px_50px_-10px_rgba(4,7,17,0.75),0_0_25px_-5px_rgba(37,99,235,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.35),inset_0_-1px_2px_rgba(0,0,0,0.5)]
            "
          >
            {/* 1. Home */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-b from-[#8B5CF6]/95 via-[#7C3AED]/95 to-[#6D28D9]/95 text-white shadow-[0_4px_16px_rgba(139,92,246,0.65),inset_0_1px_1px_rgba(255,255,255,0.5)] border border-white/30 scale-[1.02]'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Home className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.9]'}`} />
                  <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                    Home
                  </span>
                </>
              )}
            </NavLink>

            {/* 2. Explore / Today */}
            <NavLink
              to="/today"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-b from-[#8B5CF6]/95 via-[#7C3AED]/95 to-[#6D28D9]/95 text-white shadow-[0_4px_16px_rgba(139,92,246,0.65),inset_0_1px_1px_rgba(255,255,255,0.5)] border border-white/30 scale-[1.02]'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Compass className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.9]'}`} />
                  <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                    Explore
                  </span>
                </>
              )}
            </NavLink>

            {/* 3. Study Analytics */}
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-b from-[#8B5CF6]/95 via-[#7C3AED]/95 to-[#6D28D9]/95 text-white shadow-[0_4px_16px_rgba(139,92,246,0.65),inset_0_1px_1px_rgba(255,255,255,0.5)] border border-white/30 scale-[1.02]'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10'
                }`
              }
              title="Study Analytics"
            >
              {({ isActive }) => (
                <>
                  <BarChart3 className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.9]'}`} />
                  <span className={`text-[10px] tracking-tight mt-0.5 truncate max-w-full text-center ${isActive ? 'font-bold text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                    Analytics
                  </span>
                </>
              )}
            </NavLink>

            {/* 4. Timer */}
            <NavLink
              to="/timer"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-b from-[#8B5CF6]/95 via-[#7C3AED]/95 to-[#6D28D9]/95 text-white shadow-[0_4px_16px_rgba(139,92,246,0.65),inset_0_1px_1px_rgba(255,255,255,0.5)] border border-white/30 scale-[1.02]'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Timer className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.9]'}`} />
                  <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                    Timer
                  </span>
                </>
              )}
            </NavLink>

            {/* 5. Profile / Settings */}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-b from-[#8B5CF6]/95 via-[#7C3AED]/95 to-[#6D28D9]/95 text-white shadow-[0_4px_16px_rgba(139,92,246,0.65),inset_0_1px_1px_rgba(255,255,255,0.5)] border border-white/30 scale-[1.02]'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <User className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.9]'}`} />
                  <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                    Profile
                  </span>
                </>
              )}
            </NavLink>
          </nav>
        </div>

        {/* 4. Global Task Modal */}
        <TaskModal
          isOpen={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          initialTask={editingTask}
        />
      </div>
    </BrowserRouter>
  );
}
