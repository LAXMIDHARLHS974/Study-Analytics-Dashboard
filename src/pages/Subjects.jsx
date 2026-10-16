import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookMarked, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Play, 
  Trash2, 
  Edit3,
  Layers,
  Sparkles
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { calculateSubjectDistribution } from '../utils/studyStats';

export default function Subjects() {
  const navigate = useNavigate();
  const { subjects, addSubject, deleteSubject, tasks, timerLogs } = useTaskStore();
  const { setTimerState } = useSettingsStore();

  const { distribution } = calculateSubjectDistribution(timerLogs, subjects, 'week');
  const weeklyHoursMap = {};
  distribution.forEach((d) => {
    weeklyHoursMap[d.name] = d.hours;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubj, setNewSubj] = useState({
    name: '',
    code: '',
    color: '#5FB3B3',
    targetHoursWeekly: 8,
    totalChapters: 12,
  });

  const handleStartTimer = (subjName) => {
    setTimerState({
      activeSubject: subjName,
      timerSecondsLeft: 25 * 60,
      isTimerRunning: true,
      timerMode: 'work',
    });
    navigate('/timer');
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newSubj.name.trim()) return;
    addSubject(newSubj);
    setIsModalOpen(false);
    setNewSubj({
      name: '',
      code: '',
      color: '#5FB3B3',
      targetHoursWeekly: 8,
      totalChapters: 12,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="clay-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue/20 text-brand-blue text-xs font-bold">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Curriculum Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
            Subjects & Syllabus Progress
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Track weekly study targets, chapter completion, and launch subject focus sessions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="neu-teal-btn px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subj) => {
            const subjTasks = tasks.filter((t) => t.subjectId === subj.id || t.subject === subj.name);
            const weeklyHours = weeklyHoursMap[subj.name] !== undefined
              ? weeklyHoursMap[subj.name]
              : (subj.completedHoursThisWeek || 0);
            const weeklyPct = Math.min(
              100,
              Math.round((weeklyHours / (subj.targetHoursWeekly || 1)) * 100)
            );

            return (
              <div
                key={subj.id}
                className="clay-card p-5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
              >
                <div>
                  {/* Top Row: Color badge & Code */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full shadow-inner ring-2 ring-white/80 dark:ring-slate-700"
                        style={{ backgroundColor: subj.color }}
                      />
                      <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                        {subj.code}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-slate-500">
                      {subjTasks.length} tasks
                    </span>
                  </div>

                  {/* Subject Name */}
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">
                    {subj.name}
                  </h3>

                  {/* Syllabus Progress */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Syllabus Completion</span>
                      <span className="text-slate-800 dark:text-white font-extrabold">
                        {subj.syllabusProgress}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${subj.syllabusProgress}%`,
                          backgroundColor: subj.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>
                        {subj.completedChapters || 0} / {subj.totalChapters || 10} chapters done
                      </span>
                    </div>
                  </div>

                  {/* Weekly Hours Target */}
                  <div className="mt-4 p-3 rounded-2xl neu-inset space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-brand-teal" />
                        Weekly Study Hours
                      </span>
                      <span className="text-slate-800 dark:text-white font-extrabold">
                        {weeklyHours}h / {subj.targetHoursWeekly}h
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-teal transition-all duration-300"
                        style={{ width: `${weeklyPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                  <button
                    onClick={() => handleStartTimer(subj.name)}
                    className="neu-teal-btn px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Focus Sprint</span>
                  </button>

                  <button
                    onClick={() => deleteSubject(subj.id)}
                    className="p-1.5 text-slate-400 hover:text-brand-coral transition-colors"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="clay-card p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-brand-teal/15 text-brand-teal flex items-center justify-center shadow-inner">
            <BookMarked className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              No Subjects Added Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
              Add your genuine school, college, or self-study subjects to track weekly study hours and focus sprints.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="neu-teal-btn px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Your First Subject</span>
          </button>
        </div>
      )}

      {/* Add Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md clay-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              Add New Subject
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSubj.name}
                  onChange={(e) => setNewSubj({ ...newSubj, name: e.target.value })}
                  placeholder="e.g. Organic Chemistry"
                  className="w-full px-4 py-2.5 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={newSubj.code}
                    onChange={(e) => setNewSubj({ ...newSubj, code: e.target.value })}
                    placeholder="CHEM-101"
                    className="w-full px-3 py-2 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Color Theme
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newSubj.color}
                      onChange={(e) => setNewSubj({ ...newSubj, color: e.target.value })}
                      className="w-10 h-9 rounded-xl cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-slate-500">{newSubj.color}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Hours/Week
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newSubj.targetHoursWeekly}
                    onChange={(e) =>
                      setNewSubj({ ...newSubj, targetHoursWeekly: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Chapters
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newSubj.totalChapters}
                    onChange={(e) =>
                      setNewSubj({ ...newSubj, totalChapters: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
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
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
