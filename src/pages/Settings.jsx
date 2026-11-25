import React, { useState, useRef } from 'react';
import { 
  User, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Camera,
  Trash2,
  UploadCloud,
  ExternalLink,
  Lock,
  LogOut,
  Mail,
  Flame,
  BookMarked
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTaskStore } from '../store/useTaskStore';
import { useAuthStore } from '../store/useAuthStore';
import { calculateStreak } from '../utils/studyStats';

const DEFAULT_AVATAR = '/assets/student_avatar.jpg';

export default function Settings() {
  const { 
    userName, 
    userAvatar, 
    updateProfile 
  } = useSettingsStore();

  const { tasks, subjects, timerLogs, exportDataJSON, importDataJSON, resetAllData } = useTaskStore();
  const { users, currentUserId, signOut, updateCurrentUserName, changePassword } = useAuthStore();
  const currentUser = users.find((u) => u.id === currentUserId);
  const { currentStreak } = calculateStreak(timerLogs, tasks);
  const completedTasksCount = tasks.filter((t) => t.status === 'Done').length;

  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const [profileName, setProfileName] = useState(userName);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // Client-side image processor for avatar upload
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFeedbackMsg('Please select a valid image file (PNG, JPG, WebP)');
      setTimeout(() => setFeedbackMsg(''), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Resize to 320x320 max for high visual quality and minimal localStorage footprint
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        updateProfile({ userAvatar: compressedDataUrl });
        setFeedbackMsg('Profile photo uploaded successfully! 📸✨');
        setTimeout(() => setFeedbackMsg(''), 3000);
      };
      img.src = e.target?.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleResetAvatar = () => {
    updateProfile({ userAvatar: DEFAULT_AVATAR });
    setFeedbackMsg('Avatar reset to default! ✨');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ userName: profileName });
    updateCurrentUserName(profileName);
    setFeedbackMsg('Profile updated successfully! ✨');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    const res = await changePassword({ currentPassword, newPassword });
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMsg('Password updated successfully!');
      setTimeout(() => setPasswordMsg(''), 3000);
    } else {
      setPasswordMsg(res.error || 'Could not update password.');
    }
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

  const isCustomUploadedAvatar = Boolean(userAvatar && userAvatar !== DEFAULT_AVATAR);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Feedback Alert */}
      {feedbackMsg && (
        <div className="clay-card p-4 bg-brand-teal/15 border border-brand-teal/40 text-brand-teal font-bold text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 1. Redesigned Profile Card */}
      <div className="clay-card overflow-hidden relative">
        {/* Hidden file input for avatar */}
        <input
          type="file"
          ref={avatarInputRef}
          onChange={handleAvatarFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Gradient Banner Header */}
        <div className="relative h-24 sm:h-28 bg-gradient-to-r from-blue-600/25 via-indigo-500/25 to-violet-600/30 dark:from-blue-600/30 dark:via-indigo-600/25 dark:to-violet-600/35 border-b border-white/30 dark:border-white/10 px-4 sm:px-7 pt-4 flex items-start justify-between">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-violet-500/20 blur-2xl" />
            <div className="absolute -bottom-10 left-1/3 w-36 h-36 rounded-full bg-teal-400/20 blur-2xl" />
          </div>

          <h3 className="relative z-10 text-sm sm:text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/60 dark:bg-slate-900/60 text-indigo-600 dark:text-indigo-300 border border-white/60 dark:border-white/10 shadow-xs">
              <User className="w-4 h-4" />
            </span>
            <span>Profile & Persona</span>
          </h3>

          <span className="relative z-10 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
            Active Student
          </span>
        </div>

        {/* Profile Body */}
        <div className="px-4 sm:px-7 pb-5 sm:pb-7">
          {/* Overlapping Avatar + Identity & Stats Row */}
          <div className="-mt-12 sm:-mt-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-200/70 dark:border-slate-800/80">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              {/* Interactive Avatar with Drag & Drop */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => avatarInputRef.current?.click()}
                className={`relative group cursor-pointer w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 transition-all duration-300 shrink-0 ${
                  isDragging
                    ? 'ring-4 ring-brand-teal scale-105 bg-brand-teal/20'
                    : 'bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-500 shadow-xl hover:scale-[1.03]'
                }`}
              >
                <div className="w-full h-full rounded-[20px] overflow-hidden bg-slate-900 ring-2 ring-white/90 dark:ring-slate-900 relative">
                  <img
                    src={userAvatar || DEFAULT_AVATAR}
                    alt={userName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                    <Camera className="w-5 h-5 text-indigo-300" />
                    <span className="text-[10px] font-bold">Change</span>
                  </div>
                </div>

                <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md border-2 border-white dark:border-slate-900">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Display Name, Email & Mini Badges */}
              <div className="space-y-1.5 pb-0.5">
                <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {userName || 'Student'}
                </h4>
                {currentUser?.email && (
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{currentUser.email}</span>
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg neu-inset text-amber-600 dark:text-amber-300">
                    <Flame className="w-3 h-3" />
                    {currentStreak}d Streak
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg neu-inset text-emerald-600 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    {completedTasksCount} Done
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg neu-inset text-indigo-600 dark:text-indigo-300">
                    <BookMarked className="w-3 h-3" />
                    {subjects.length} Subjects
                  </span>
                </div>
              </div>
            </div>

            {/* Compact Photo & Website Actions */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 shrink-0">
              <a
                href="https://my-website-5lor.onrender.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-500/15 to-violet-500/10 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-violet-500/20 hover:from-blue-600/20 hover:via-indigo-500/25 hover:to-violet-500/20 border border-indigo-200/60 dark:border-indigo-500/40 hover:border-indigo-400 shadow-sm text-xs font-extrabold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white flex items-center gap-1.5 transition-all active:scale-95"
                title="Visit LHS Website"
              >
                <span>Build by LHS 🦅</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>

              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="neu-pill-btn px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-300"
              >
                <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />
                <span>Upload Photo</span>
              </button>

              {isCustomUploadedAvatar && (
                <button
                  type="button"
                  onClick={handleResetAvatar}
                  className="p-2 rounded-xl neu-pill-btn text-slate-400 hover:text-rose-500 transition-colors"
                  title="Remove Custom Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
            <div className={currentUser?.email ? 'sm:col-span-5' : 'sm:col-span-9'}>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>Display Name</span>
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3.5 py-2.5 rounded-xl neu-inset border border-slate-200/80 dark:border-slate-700/80 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {currentUser?.email && (
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Account Email</span>
                </label>
                <input
                  type="email"
                  readOnly
                  value={currentUser.email}
                  className="w-full px-3.5 py-2.5 rounded-xl neu-inset border border-slate-200/60 dark:border-slate-700/60 text-sm font-medium text-slate-500 dark:text-slate-400 focus:outline-none cursor-default"
                />
              </div>
            )}

            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full neu-teal-btn px-5 py-2.5 text-xs font-extrabold shadow flex items-center justify-center gap-2 rounded-xl"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 2. Local Storage Backup & Data Reset */}
      <div className="clay-card p-4 sm:p-6 space-y-4 border border-slate-300/60 dark:border-slate-700/60">
        <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Local Storage & Backup (Offline First)</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={exportDataJSON}
            className="neu-teal-btn px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow"
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
            className="neu-pill-btn px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4 text-brand-blue" />
            <span>Import Backup (JSON)</span>
          </button>

          {/* Reset All Data */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="neu-pill-btn px-4 py-2 text-xs font-bold text-brand-coral hover:bg-brand-coral hover:text-white flex items-center justify-center gap-2 sm:ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Data</span>
          </button>
        </div>
      </div>

      {/* 3. Account & Security */}
      <div className="clay-card p-4 sm:p-6 space-y-4 border border-slate-300/60 dark:border-slate-700/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-violet-500" />
              <span>Account & Security</span>
            </h3>
            {currentUser?.email && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span>Signed in as {currentUser.email}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={signOut}
            className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-600 dark:text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="px-3.5 py-2 rounded-xl neu-inset border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min 6 chars)"
            className="px-3.5 py-2 rounded-xl neu-inset border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
          />
          <button
            type="submit"
            className="neu-teal-btn px-4 py-2 text-xs font-bold shadow flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Update Password</span>
          </button>
        </form>

        {passwordMsg && (
          <p className="text-xs font-bold text-brand-teal">{passwordMsg}</p>
        )}
      </div>

      {/* Reset Confirmation Dialog Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm clay-card p-4 sm:p-6 shadow-2xl space-y-4">
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
