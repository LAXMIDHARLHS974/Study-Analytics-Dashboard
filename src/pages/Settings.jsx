import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Download, 
  Upload, 
  RotateCcw, 
  Sun, 
  Moon, 
  Timer, 
  Volume2, 
  Bell, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTaskStore } from '../store/useTaskStore';
import { requestNotificationPermission } from '../utils/notifications';

const AVATAR_OPTIONS = [
  { id: 'boy', name: 'Clay Boy (Headphones)', path: '/assets/student_avatar.jpg' },
  { id: 'shelf', name: 'Study Desk Hero', path: '/assets/student_shelf_hero.jpg' },
  { id: 'star', name: 'Cute Star Mascot', path: '/assets/cute_star_mascot.jpg' },
  { id: 'nook', name: 'Cozy Nook', path: '/assets/cozy_study_nook.jpg' },
];

export default function Settings() {
  const { 
    userName, 
    userAvatar, 
    userMotto, 
    updateProfile, 
    theme, 
    toggleTheme,
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    updateTimerSettings,
    soundEnabled
  } = useSettingsStore();

  const { exportDataJSON, importDataJSON, resetAllData } = useTaskStore();

  const fileInputRef = useRef(null);
  const [profileName, setProfileName] = useState(userName);
  const [profileMotto, setProfileMotto] = useState(userMotto);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ userName: profileName, userMotto: profileMotto });
    setFeedbackMsg('Profile updated successfully! ✨');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = importDataJSON(content);
        if (result.success) {
          setFeedbackMsg('Data restored successfully from backup! 🎉');
        } else {
          setFeedbackMsg(`Import failed: ${result.error}`);
        }
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetConfirm = () => {
    resetAllData();
    setShowResetConfirm(false);
    setFeedbackMsg('All data has been reset to default demo seed! 🔄');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setFeedbackMsg('Browser notifications granted! 🔔');
    } else {
      setFeedbackMsg('Browser notifications blocked or not allowed by browser.');
    }
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="clay-card p-6 flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Preferences & Data Management</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
            App Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Customize your persona, timer defaults, theme, and export/import offline backups.
          </p>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div className="clay-card p-4 bg-brand-teal/15 border border-brand-teal/40 text-brand-teal font-bold text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 1. Profile Customization */}
      <div className="clay-card p-6 space-y-5">
        <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-brand-teal" />
          <span>Profile & Persona</span>
        </h3>

        {/* Avatar Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
            Select 3D Clay Avatar
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AVATAR_OPTIONS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => updateProfile({ userAvatar: av.path })}
                className={`p-2.5 rounded-2xl flex flex-col items-center gap-2 transition-all border ${
                  userAvatar === av.path
                    ? 'ring-2 ring-brand-teal bg-brand-teal/10 border-brand-teal'
                    : 'neu-inset border-transparent hover:border-slate-400'
                }`}
              >
                <img
                  src={av.path}
                  alt={av.name}
                  className="w-14 h-14 object-cover rounded-full shadow"
                />
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                  {av.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Name and Motto Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Focus Motto / Tagline
              </label>
              <input
                type="text"
                value={profileMotto}
                onChange={(e) => setProfileMotto(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl neu-inset border border-white/60 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="neu-teal-btn px-5 py-2 text-xs font-bold shadow">
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* 2. Pomodoro Timer Durations */}
      <div className="clay-card p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Timer className="w-4 h-4 text-brand-blue" />
          <span>Timer Configuration (Minutes)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Focus Work Interval
            </label>
            <input
              type="number"
              min="5"
              max="90"
              value={workDuration}
              onChange={(e) => updateTimerSettings({ workDuration: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl neu-inset text-xs font-bold text-slate-800 dark:text-white border border-white/60 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Short Break
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={shortBreakDuration}
              onChange={(e) => updateTimerSettings({ shortBreakDuration: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl neu-inset text-xs font-bold text-slate-800 dark:text-white border border-white/60 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Long Break
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={longBreakDuration}
              onChange={(e) => updateTimerSettings({ longBreakDuration: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl neu-inset text-xs font-bold text-slate-800 dark:text-white border border-white/60 dark:border-slate-700"
            />
          </div>
        </div>
      </div>

      {/* 3. Theme & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="clay-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Theme Mode</span>
          </h3>
          <p className="text-xs text-slate-500">
            Switch between light soft neumorphic canvas and deep navy night mode.
          </p>
          <button
            onClick={toggleTheme}
            className="neu-pill-btn px-4 py-2 text-xs font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Switch to Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span>Switch to Dark Theme</span>
              </>
            )}
          </button>
        </div>

        <div className="clay-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-teal" />
            <span>Browser Notifications</span>
          </h3>
          <p className="text-xs text-slate-500">
            Get alerts when Pomodoro focus sprint ends or break time is over.
          </p>
          <button
            onClick={handleEnableNotifications}
            className="neu-pill-btn px-4 py-2 text-xs font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200"
          >
            <Bell className="w-4 h-4 text-brand-teal" />
            <span>Request Notification Permission</span>
          </button>
        </div>
      </div>

      {/* 4. Local Storage Backup & Data Reset */}
      <div className="clay-card p-6 space-y-4 border border-slate-300/60 dark:border-slate-700/60">
        <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Local Storage & Backup (Offline First)</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          All your tasks, routines, subjects, study logs, and streaks are safely cached in localStorage
          under key <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">build-lhs-v1</code>.
          You can download a JSON backup anytime or restore it.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={exportDataJSON}
            className="neu-teal-btn px-4 py-2 text-xs font-bold flex items-center gap-2 shadow"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
          </button>

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="neu-pill-btn px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-brand-blue" />
            <span>Import Backup (JSON)</span>
          </button>

          {/* Reset All Data */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="neu-pill-btn px-4 py-2 text-xs font-bold text-brand-coral hover:bg-brand-coral hover:text-white flex items-center gap-2 ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Data</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm clay-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-coral/20 text-brand-coral flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-white">
                  Reset All Data?
                </h4>
                <p className="text-xs text-slate-500">
                  This will reload the initial demo tasks, subjects, routines, and heatmap.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-300/40 dark:border-slate-700/60">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="neu-pill-btn px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleResetConfirm}
                className="px-4 py-2 rounded-full bg-brand-coral text-white text-xs font-bold shadow hover:brightness-110"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
