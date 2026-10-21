import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
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
  ExternalLink
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTaskStore } from '../store/useTaskStore';

const DEFAULT_AVATAR = '/assets/student_avatar.jpg';

export default function Settings() {
  const { 
    userName, 
    userAvatar, 
    updateProfile 
  } = useSettingsStore();

  const { exportDataJSON, importDataJSON, resetAllData } = useTaskStore();

  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const [profileName, setProfileName] = useState(userName);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

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

  const isCustomUploadedAvatar = Boolean(userAvatar && userAvatar !== DEFAULT_AVATAR);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="clay-card p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
            App Settings
          </h2>
        </div>

        <a
          href="https://laxmidharlhs974.github.io/my-website-LHS/"
          target="_blank"
          rel="noopener noreferrer"
          className="group px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-500/15 to-violet-500/10 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-violet-500/20 hover:from-blue-600/20 hover:via-indigo-500/25 hover:to-violet-500/20 border border-indigo-200/60 dark:border-indigo-500/40 hover:border-indigo-400 dark:hover:border-indigo-400 shadow-sm hover:shadow-md text-xs sm:text-sm font-extrabold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white flex items-center gap-1.5 tracking-wide transition-all duration-200 active:scale-95 cursor-pointer"
          title="Visit LHS Website"
        >
          <span>Build by LHS 🦅</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </a>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div className="clay-card p-4 bg-brand-teal/15 border border-brand-teal/40 text-brand-teal font-bold text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 1. Redesigned Profile & Persona with Upload Function */}
      <div className="clay-card p-4 sm:p-7 space-y-6 relative overflow-hidden">
        {/* Ambient background blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal/5 dark:bg-brand-teal/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <User className="w-4 h-4" />
            </div>
            <span>Profile & Persona</span>
          </h3>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-300 border border-teal-500/30">
            Active Student
          </span>
        </div>

        {/* Profile Card Main Layout: Avatar Uploader on Left, Details on Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Avatar Upload Container */}
          <div className="md:col-span-5 flex flex-col items-center text-center p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            {/* Hidden file input */}
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Interactive Avatar Frame with Drag & Drop */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => avatarInputRef.current?.click()}
              className={`relative group cursor-pointer w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1.5 transition-all duration-300 ${
                isDragging
                  ? 'ring-4 ring-brand-teal scale-105 bg-brand-teal/20'
                  : 'bg-gradient-to-tr from-teal-400 via-indigo-500 to-purple-600 shadow-lg hover:shadow-xl hover:scale-102'
              }`}
            >
              <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-900 relative">
                <img
                  src={userAvatar || '/assets/student_avatar.jpg'}
                  alt={userName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Hover overlay with Camera icon */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                  <Camera className="w-6 h-6 text-teal-300" />
                  <span className="text-[10px] font-bold tracking-wide">Upload Photo</span>
                </div>
              </div>

              {/* Camera icon badge */}
              <div className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-teal-500 text-white shadow-md border-2 border-white dark:border-slate-800 group-hover:scale-110 transition-transform">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Upload Buttons */}
            <div className="w-full mt-4 space-y-2">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl neu-teal-btn text-xs font-bold flex items-center justify-center gap-2 shadow"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload New Photo</span>
              </button>

              {isCustomUploadedAvatar && (
                <button
                  type="button"
                  onClick={handleResetAvatar}
                  className="w-full py-1.5 px-3 rounded-xl text-slate-500 hover:text-red-500 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Custom Photo</span>
                </button>
              )}
            </div>
          </div>

          {/* Form: Name */}
          <div className="md:col-span-7 flex flex-col justify-center h-full">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-500" />
                  <span>Your Name</span>
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2.5 rounded-xl neu-inset border border-slate-200/80 dark:border-slate-700/80 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="neu-teal-btn px-6 py-2.5 text-xs font-extrabold shadow flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
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
