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

import { LayoutDashboard, Clock, CalendarDays, Timer, BarChart3 } from 'lucide-react';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

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
      <div className="min-h-screen bg-[#9FB3C8] dark:bg-[#101827] text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm md:hidden animate-in fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 1. Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* 2. Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 md:pb-6">
          {/* Top Bar */}
          <TopBar
            onOpenSidebar={() => setSidebarOpen(true)}
            onOpenNewTask={handleOpenNewTask}
          />

          {/* Route Content View */}
          <main className="flex-1 px-4 lg:px-8 py-3 max-w-7xl w-full mx-auto">
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

        {/* 3. Mobile Bottom Navigation Bar (Phone-friendly quick switches) */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-[#202D42]/95 backdrop-blur-md border-t border-slate-700/60 py-2 px-4 flex items-center justify-around shadow-2xl">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-bold ${
                isActive ? 'text-brand-teal' : 'text-slate-400'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/today"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-bold ${
                isActive ? 'text-brand-teal' : 'text-slate-400'
              }`
            }
          >
            <Clock className="w-5 h-5" />
            <span>Today</span>
          </NavLink>

          <button
            onClick={handleOpenNewTask}
            className="w-12 h-12 -mt-5 rounded-full neu-teal-btn flex items-center justify-center shadow-2xl text-white active:scale-95 transition-all"
            title="Create Task"
          >
            <span className="text-xl font-bold leading-none">+</span>
          </button>

          <NavLink
            to="/timer"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-bold ${
                isActive ? 'text-brand-teal' : 'text-slate-400'
              }`
            }
          >
            <Timer className="w-5 h-5" />
            <span>Timer</span>
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-bold ${
                isActive ? 'text-brand-teal' : 'text-slate-400'
              }`
            }
          >
            <BarChart3 className="w-5 h-5" />
            <span>Stats</span>
          </NavLink>
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
