import React, { useState } from 'react';
import { Target, Flag, CheckCircle2, Trophy, Plus, Sparkles, BookOpen, Edit3, X, Check } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

export default function YearPlan() {
  const { yearlyPlan, updateMonthPlan } = useTaskStore();
  const months = yearlyPlan || [];

  const [editingMonth, setEditingMonth] = useState(null);
  const [modalForm, setModalForm] = useState({
    milestone: '',
    targetHours: 140,
    loggedHours: 0,
    progress: 0,
    status: 'Upcoming',
  });

  const completedMonths = months.filter((m) => m.status === 'Completed').length;
  const totalTargetHours = months.reduce((a, b) => a + (Number(b.targetHours) || 0), 0);
  const totalLoggedHours = months.reduce((a, b) => a + (Number(b.loggedHours) || 0), 0);

  const openEditModal = (month) => {
    setEditingMonth(month);
    setModalForm({
      milestone: month.milestone || '',
      targetHours: month.targetHours || 140,
      loggedHours: month.loggedHours || 0,
      progress: month.progress || 0,
      status: month.status || 'Upcoming',
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editingMonth) return;

    const updatedProgress = Number(modalForm.progress);
    const updatedStatus = updatedProgress >= 100 ? 'Completed' : modalForm.status;

    updateMonthPlan(editingMonth.id, {
      milestone: modalForm.milestone,
      targetHours: Number(modalForm.targetHours),
      loggedHours: Number(modalForm.loggedHours),
      progress: updatedProgress,
      status: updatedStatus,
    });

    soundManager.playSuccess();
    if (updatedStatus === 'Completed' || updatedProgress >= 100) {
      triggerConfetti();
    }
    setEditingMonth(null);
  };

  return (
    <div className="space-y-6">
      {/* Yearly Overview Card (Square-type) */}
      <div className="clay-card p-5 sm:p-6 shadow-neu-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-purple/20 text-brand-purple text-xs font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>Academic Roadmap 2026-2027</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
            12-Month Master Strategy
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg">
            High-level curriculum roadmap, monthly milestone goals, and total study hours progress bar. Click any month card to edit!
          </p>
        </div>

        {/* Big Year Stats (Square-type insets) */}
        <div className="flex items-center justify-center gap-3 w-full md:w-auto shrink-0">
          <div className="text-center p-3 rounded-xl neu-inset min-w-[90px] flex-1 sm:flex-none">
            <span className="text-xl font-black text-brand-teal">{completedMonths}/12</span>
            <span className="block text-[10px] text-slate-500 font-bold uppercase mt-0.5">Months Done</span>
          </div>

          <div className="text-center p-3 rounded-xl neu-inset min-w-[100px] flex-1 sm:flex-none">
            <span className="text-xl font-black text-brand-blue">{totalLoggedHours}h</span>
            <span className="block text-[10px] text-slate-500 font-bold uppercase mt-0.5">Total Hours</span>
          </div>
        </div>
      </div>

      {/* 12-Month Grid (Square-type cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map((m) => {
          const isDone = m.status === 'Completed';
          const isInProgress = m.status === 'In Progress';

          return (
            <div
              key={m.id}
              onClick={() => openEditModal(m)}
              className={`clay-card p-4 rounded-xl flex flex-col justify-between transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-lg ${
                isInProgress
                  ? 'ring-2 ring-brand-teal shadow-xl'
                  : ''
              }`}
            >
              <div>
                {/* Month Name & Status Badge */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <span>{m.name}</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : isInProgress
                          ? 'bg-brand-teal/20 text-brand-teal animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {m.status}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(m);
                      }}
                      className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-teal transition-colors"
                      title="Edit this month's plan"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Milestone Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-3">
                  {m.milestone}
                </p>
              </div>

              {/* Progress and Target Hours */}
              <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Progress</span>
                  <span className="text-slate-800 dark:text-white font-extrabold">{m.progress}%</span>
                </div>

                <div className="w-full h-2 rounded-md bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-md transition-all duration-500 ${
                      isDone ? 'bg-emerald-500' : isInProgress ? 'bg-brand-teal' : 'bg-slate-400'
                    }`}
                    style={{ width: `${m.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold pt-1">
                  <span>Target: {m.targetHours}h</span>
                  <span>Logged: {m.loggedHours}h</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Month Plan Modal */}
      {editingMonth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md clay-card p-4 sm:p-6 shadow-2xl space-y-4 rounded-xl max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-300/40 dark:border-slate-700/60">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Edit {editingMonth.name} Plan
                </h3>
                <p className="text-xs text-slate-500">Update curriculum milestones & target study hours</p>
              </div>
              <button
                onClick={() => setEditingMonth(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Milestone Goal *
                </label>
                <textarea
                  rows={2}
                  required
                  value={modalForm.milestone}
                  onChange={(e) => setModalForm({ ...modalForm, milestone: e.target.value })}
                  placeholder="e.g. Finish Calculus syllabus & 5 Mock Tests"
                  className="w-full px-3.5 py-2 rounded-xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Study Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={modalForm.targetHours}
                    onChange={(e) => setModalForm({ ...modalForm, targetHours: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Logged Study Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={modalForm.loggedHours}
                    onChange={(e) => setModalForm({ ...modalForm, loggedHours: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Progress ({modalForm.progress}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={modalForm.progress}
                    onChange={(e) => setModalForm({ ...modalForm, progress: Number(e.target.value) })}
                    className="w-full accent-brand-teal mt-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="Upcoming" className="bg-slate-800 text-white">Upcoming</option>
                    <option value="In Progress" className="bg-slate-800 text-white">In Progress</option>
                    <option value="Completed" className="bg-slate-800 text-white">Completed</option>
                  </select>
                </div>
              </div>

              {/* Quick Action Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 mr-1">Quick:</span>
                <button
                  type="button"
                  onClick={() =>
                    setModalForm((prev) => ({
                      ...prev,
                      loggedHours: prev.loggedHours + 10,
                    }))
                  }
                  className="px-2 py-0.5 rounded-md neu-pill-btn text-[10px] font-bold text-slate-700 dark:text-slate-300"
                >
                  +10h
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setModalForm((prev) => ({
                      ...prev,
                      progress: Math.min(100, prev.progress + 25),
                      status: prev.progress + 25 >= 100 ? 'Completed' : 'In Progress',
                    }))
                  }
                  className="px-2 py-0.5 rounded-md neu-pill-btn text-[10px] font-bold text-slate-700 dark:text-slate-300"
                >
                  +25%
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setModalForm((prev) => ({
                      ...prev,
                      progress: 100,
                      status: 'Completed',
                    }))
                  }
                  className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/30"
                >
                  Mark 100% Done
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-300/40 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setEditingMonth(null)}
                  className="neu-pill-btn px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neu-teal-btn px-4 py-1.5 text-xs font-bold shadow"
                >
                  Save Month Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
