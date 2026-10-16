import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { format } from 'date-fns';
import { formatTo12Hour } from '../../utils/timeFormat';

export default function TaskModal({ isOpen, onClose, initialTask = null }) {
  const { subjects, goals, addTask, updateTask } = useTaskStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: subjects[0]?.id || '',
    subject: subjects[0]?.name || '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    priority: 'Medium',
    status: 'Todo',
    repeat: 'none',
    reminder: true,
    goalId: '',
  });

  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title || '',
        description: initialTask.description || '',
        subjectId: initialTask.subjectId || subjects[0]?.id || '',
        subject: initialTask.subject || subjects[0]?.name || '',
        date: initialTask.date || format(new Date(), 'yyyy-MM-dd'),
        startTime: initialTask.startTime || '10:00',
        endTime: initialTask.endTime || '11:00',
        duration: initialTask.duration || 60,
        priority: initialTask.priority || 'Medium',
        status: initialTask.status || 'Todo',
        repeat: initialTask.repeat || 'none',
        reminder: Boolean(initialTask.reminder),
        goalId: initialTask.goalId || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        subjectId: subjects[0]?.id || '',
        subject: subjects[0]?.name || '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        priority: 'Medium',
        status: 'Todo',
        repeat: 'none',
        reminder: true,
        goalId: '',
      });
    }
  }, [initialTask, isOpen, subjects]);

  if (!isOpen) return null;

  const handleSubjectChange = (e) => {
    const selectedSubj = subjects.find((s) => s.id === e.target.value);
    setFormData((prev) => ({
      ...prev,
      subjectId: e.target.value,
      subject: selectedSubj ? selectedSubj.name : prev.subject,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (initialTask) {
      updateTask(initialTask.id, formData);
    } else {
      addTask(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg clay-card p-6 shadow-2xl border border-white/60 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-300/40 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-teal/20 text-brand-teal flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {initialTask ? 'Edit Study Task' : 'Plan New Study Task'}
              </h3>
              <p className="text-xs text-slate-500">Design your focus sprint</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Calculus: Practice Integration by Parts"
              className="w-full px-4 py-2.5 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
            />
          </div>

          {/* Subject & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              {subjects.length > 0 ? (
                <select
                  value={formData.subjectId}
                  onChange={handleSubjectChange}
                  className="w-full px-3 py-2 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-800 text-white">
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Enter subject name (e.g. Maths, Science)"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subject: e.target.value,
                      subjectId: `subj-${Date.now()}`,
                    })
                  }
                  className="w-full px-3 py-2 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl neu-inset">
                {['Low', 'Medium', 'High'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      formData.priority === p
                        ? p === 'High'
                          ? 'bg-brand-coral text-white shadow-sm'
                          : p === 'Medium'
                          ? 'bg-brand-amber text-slate-900 shadow-sm'
                          : 'bg-brand-mint text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Start Time <span className="text-brand-teal font-mono font-semibold">({formatTo12Hour(formData.startTime)})</span>
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Duration (mins)
              </label>
              <input
                type="number"
                min="10"
                step="5"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>
          </div>

          {/* Status & Repeat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option value="Todo" className="bg-slate-800 text-white">Todo</option>
                <option value="In Progress" className="bg-slate-800 text-white">In Progress</option>
                <option value="Done" className="bg-slate-800 text-white">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Repeat Routine
              </label>
              <select
                value={formData.repeat}
                onChange={(e) => setFormData({ ...formData, repeat: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option value="none" className="bg-slate-800 text-white">None (Once)</option>
                <option value="daily" className="bg-slate-800 text-white">Daily</option>
                <option value="weekly" className="bg-slate-800 text-white">Weekly</option>
                <option value="monthly" className="bg-slate-800 text-white">Monthly</option>
              </select>
            </div>
          </div>

          {/* Linked Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Link to Long-Term Goal (Optional)
            </label>
            <select
              value={formData.goalId}
              onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
              className="w-full px-3 py-2 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
            >
              <option value="" className="bg-slate-800 text-white">None</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id} className="bg-slate-800 text-white">
                  {g.title} ({g.progress}%)
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Problem References
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Textbook chapter 4 exercises 1-20, review notes..."
              className="w-full px-4 py-2 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-300/40 dark:border-slate-700/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full neu-pill-btn text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full neu-teal-btn text-xs font-bold shadow-lg"
            >
              {initialTask ? 'Save Changes' : 'Create Task 🎯'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
