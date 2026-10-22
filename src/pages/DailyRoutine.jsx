import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  Plus, 
  Calendar, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Check, 
  CheckCircle2,
  X,
  BookOpen
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { format, addDays } from 'date-fns';
import { formatTo12Hour } from '../utils/timeFormat';

export default function DailyRoutine() {
  const navigate = useNavigate();
  const { 
    routines, 
    applyRoutineToDate, 
    addRoutine, 
    updateRoutine, 
    deleteRoutine, 
    addRoutineBlock,
    updateRoutineBlock,
    deleteRoutineBlock,
    subjects 
  } = useTaskStore();

  const [activeRoutineId, setActiveRoutineId] = useState(routines[0]?.id || '');
  const [successBanner, setSuccessBanner] = useState('');

  // Routine Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ name: '', description: '', tag: 'Daily Schedule' });

  // Block Modal State
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [blockForm, setBlockForm] = useState({
    time: '08:00',
    title: '',
    duration: 60,
    type: 'Study',
    subject: subjects[0]?.name || 'General',
  });

  const activeRoutine = routines.find((r) => r.id === activeRoutineId) || routines[0];

  const handleApply = (targetDateStr, dateLabel) => {
    if (!activeRoutine) return;
    const count = applyRoutineToDate(activeRoutine.id, targetDateStr);
    soundManager.playSuccess();
    triggerConfetti();
    setSuccessBanner(`Applied "${activeRoutine.name}" to ${dateLabel}! Generated ${count} focus tasks.`);
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  const getBlockBadgeColor = (type) => {
    switch (type) {
      case 'Study': return 'bg-brand-teal/20 text-brand-teal border-brand-teal/30';
      case 'Review': return 'bg-brand-purple/20 text-brand-purple border-brand-purple/30';
      case 'Break': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Health': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  // Open Template Modal (Create or Edit)
  const openTemplateModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        description: template.description || '',
        tag: template.tag || 'Daily Schedule',
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({ name: '', description: '', tag: 'Custom Sprint' });
    }
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = (e) => {
    e.preventDefault();
    if (!templateForm.name.trim()) return;

    if (editingTemplate) {
      updateRoutine(editingTemplate.id, templateForm);
    } else {
      const newId = `routine-${Date.now()}`;
      addRoutine({
        ...templateForm,
        blocks: [],
      });
      setActiveRoutineId(newId);
    }
    setIsTemplateModalOpen(false);
  };

  // Open Block Modal (Create or Edit)
  const openBlockModal = (block = null) => {
    if (block) {
      setEditingBlock(block);
      setBlockForm({
        time: block.time || '08:00',
        title: block.title || '',
        duration: block.duration || 60,
        type: block.type || 'Study',
        subject: block.subject || subjects[0]?.name || 'General',
      });
    } else {
      setEditingBlock(null);
      setBlockForm({
        time: '09:00',
        title: '',
        duration: 60,
        type: 'Study',
        subject: subjects[0]?.name || 'General',
      });
    }
    setIsBlockModalOpen(true);
  };

  const handleSaveBlock = (e) => {
    e.preventDefault();
    if (!blockForm.title.trim() || !activeRoutine) return;

    if (editingBlock) {
      updateRoutineBlock(activeRoutine.id, editingBlock.id, blockForm);
    } else {
      addRoutineBlock(activeRoutine.id, blockForm);
    }
    setIsBlockModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="clay-card p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
            Daily Routine Builder
          </h2>
        </div>

        {/* Template Selector & New Template Button */}
        <div className="flex flex-wrap items-center gap-2">
          {routines.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRoutineId(r.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeRoutine?.id === r.id
                  ? 'neu-teal-btn text-white shadow'
                  : 'neu-pill-btn text-slate-700 dark:text-slate-300'
              }`}
            >
              {r.name}
            </button>
          ))}

          <button
            onClick={() => openTemplateModal(null)}
            className="neu-pill-btn px-3 py-1.5 rounded-lg text-xs font-bold text-brand-teal hover:bg-brand-teal hover:text-white flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Routine</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="clay-card p-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => navigate('/today')}
            className="neu-pill-btn px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1"
          >
            <span>View Timeline</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Active Routine Details */}
      {activeRoutine && (
        <div className="clay-card p-5 sm:p-6 shadow-neu-card space-y-6">
          {/* Top Bar inside Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-300/40 dark:border-slate-700/60 gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {activeRoutine.name}
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {activeRoutine.tag}
                </span>

                {/* Edit & Delete Template Buttons */}
                <button
                  onClick={() => openTemplateModal(activeRoutine)}
                  className="p-1 text-slate-400 hover:text-brand-teal transition-colors"
                  title="Edit Template Info"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {routines.length > 1 && (
                  <button
                    onClick={() => {
                      deleteRoutine(activeRoutine.id);
                      setActiveRoutineId(routines[0]?.id || '');
                    }}
                    className="p-1 text-slate-400 hover:text-brand-coral transition-colors"
                    title="Delete Routine Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Apply & Add Block Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => openBlockModal(null)}
                className="neu-teal-btn px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow flex-1 sm:flex-none"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Block</span>
              </button>

              <button
                onClick={() => handleApply(format(new Date(), 'yyyy-MM-dd'), 'Today')}
                className="neu-pill-btn px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
              >
                <Calendar className="w-3.5 h-3.5 text-brand-teal" />
                <span>Apply to Today</span>
              </button>

              <button
                onClick={() =>
                  handleApply(format(addDays(new Date(), 1), 'yyyy-MM-dd'), 'Tomorrow')
                }
                className="neu-pill-btn px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                <span>Apply to Tomorrow</span>
              </button>
            </div>
          </div>

          {/* Routine Blocks List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Schedule Blocks ({activeRoutine.blocks.length})
              </h4>
              <span className="text-[11px] text-slate-400">
                Click pencil to edit or trash to delete
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...activeRoutine.blocks]
                .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                .map((block) => (
                  <div
                    key={block.id}
                    onClick={() => openBlockModal(block)}
                    className="p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/80 dark:border-slate-700/60 flex items-center justify-between shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-brand-teal/50"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="px-2.5 py-1.5 rounded-lg neu-inset text-xs font-extrabold font-mono text-brand-teal shrink-0">
                        {formatTo12Hour(block.time)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-brand-teal transition-colors">
                          {block.title}
                        </h5>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {block.duration} mins
                          </span>
                          <span>•</span>
                          <span className="truncate">{block.subject}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getBlockBadgeColor(
                          block.type
                        )}`}
                      >
                        {block.type}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openBlockModal(block);
                        }}
                        className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-teal transition-colors"
                        title="Edit Block"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRoutineBlock(activeRoutine.id, block.id);
                        }}
                        className="p-1.5 rounded-md hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-400 hover:text-brand-coral transition-colors"
                        title="Delete Block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

              {activeRoutine.blocks.length === 0 && (
                <div className="col-span-full py-12 text-center clay-card border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                  <p className="text-xs text-slate-500">No time blocks in this routine yet.</p>
                  <button
                    onClick={() => openBlockModal(null)}
                    className="neu-teal-btn px-4 py-1.5 text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Routine Block</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Routine Template Edit/Create Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md clay-card p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-300/40 dark:border-slate-700/60">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {editingTemplate ? 'Edit Routine Template' : 'Create Routine Template'}
              </h3>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="e.g. Exam Cram Sprint"
                  className="w-full px-3.5 py-2 rounded-xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tag / Category
                </label>
                <input
                  type="text"
                  value={templateForm.tag}
                  onChange={(e) => setTemplateForm({ ...templateForm, tag: e.target.value })}
                  placeholder="e.g. Exam Focus, Weekend, Summer Plan"
                  className="w-full px-3.5 py-2 rounded-xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  placeholder="Briefly describe what this routine is tailored for..."
                  className="w-full px-3.5 py-2 rounded-xl neu-inset border border-white/60 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-300/40 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="neu-pill-btn px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neu-teal-btn px-4 py-1.5 text-xs font-bold shadow"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Routine Block Edit/Create Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md clay-card p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-300/40 dark:border-slate-700/60">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {editingBlock ? 'Edit Routine Block' : 'Add Routine Block'}
              </h3>
              <button
                onClick={() => setIsBlockModalOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBlock} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Block Title *
                </label>
                <input
                  type="text"
                  required
                  value={blockForm.title}
                  onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })}
                  placeholder="e.g. System Design Architecture"
                  className="w-full px-3.5 py-2 rounded-xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time <span className="text-brand-teal font-mono">({formatTo12Hour(blockForm.time)})</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={blockForm.time}
                    onChange={(e) => setBlockForm({ ...blockForm, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    value={blockForm.duration}
                    onChange={(e) => setBlockForm({ ...blockForm, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Block Type
                  </label>
                  <select
                    value={blockForm.type}
                    onChange={(e) => setBlockForm({ ...blockForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="Study" className="bg-slate-800 text-white">Study</option>
                    <option value="Review" className="bg-slate-800 text-white">Review</option>
                    <option value="Break" className="bg-slate-800 text-white">Break</option>
                    <option value="Health" className="bg-slate-800 text-white">Health / Workout</option>
                    <option value="School" className="bg-slate-800 text-white">School / Lecture</option>
                    <option value="Personal" className="bg-slate-800 text-white">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={blockForm.subject}
                    onChange={(e) => setBlockForm({ ...blockForm, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl neu-inset border border-white/60 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="General" className="bg-slate-800 text-white">General</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name} className="bg-slate-800 text-white">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-300/40 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="neu-pill-btn px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neu-teal-btn px-4 py-1.5 text-xs font-bold shadow"
                >
                  {editingBlock ? 'Save Block' : 'Add Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
