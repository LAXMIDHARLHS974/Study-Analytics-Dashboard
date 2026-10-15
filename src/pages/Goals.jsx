import React, { useState } from 'react';
import { Target, Plus, Calendar, CheckCircle2, Trophy, Trash2, Sparkles } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { format } from 'date-fns';

export default function Goals() {
  const { goals, addGoal, deleteGoal, tasks } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    category: 'Academic',
    targetDate: format(new Date(), 'yyyy-MM-dd'),
    color: '#5FB3B3',
    description: '',
    progress: 25,
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;
    addGoal(newGoal);
    setIsModalOpen(false);
    setNewGoal({
      title: '',
      category: 'Academic',
      targetDate: format(new Date(), 'yyyy-MM-dd'),
      color: '#5FB3B3',
      description: '',
      progress: 25,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="clay-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-teal/20 text-brand-teal text-xs font-bold">
            <Target className="w-3.5 h-3.5" />
            <span>North Star Metrics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
            Academic & Long-Term Goals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Define high-impact milestones and tie your daily study tasks to big achievements.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="neu-teal-btn px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const linkedTasks = tasks.filter((t) => t.goalId === goal.id);
          const completedLinked = linkedTasks.filter((t) => t.status === 'Done');

          return (
            <div
              key={goal.id}
              className="clay-card p-5 flex flex-col justify-between hover:shadow-xl transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                    style={{
                      backgroundColor: `${goal.color}20`,
                      color: goal.color,
                      border: `1px solid ${goal.color}40`,
                    }}
                  >
                    {goal.category}
                  </span>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                    <span>Target: {goal.targetDate}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {goal.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {goal.description}
                </p>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>Progress</span>
                    <span className="text-slate-800 dark:text-white font-extrabold">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom footer */}
              <div className="mt-5 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {linkedTasks.length > 0 ? (
                    <>
                      {completedLinked.length} / {linkedTasks.length} linked tasks completed
                    </>
                  ) : (
                    'No tasks directly linked yet'
                  )}
                </span>

                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-1.5 text-slate-400 hover:text-brand-coral transition-colors"
                  title="Delete Goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md clay-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              Create New Goal
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g. Score 98% in Math Board Exam"
                  className="w-full px-4 py-2.5 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Exams">Exams</option>
                    <option value="Skills">Skills</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Progress ({newGoal.progress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newGoal.progress}
                  onChange={(e) => setNewGoal({ ...newGoal, progress: Number(e.target.value) })}
                  className="w-full accent-brand-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Roadmap
                </label>
                <textarea
                  rows={2}
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Outline the key steps to achieve this..."
                  className="w-full px-4 py-2 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-300/40 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="neu-pill-btn px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neu-teal-btn px-5 py-2 text-xs font-bold shadow"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
