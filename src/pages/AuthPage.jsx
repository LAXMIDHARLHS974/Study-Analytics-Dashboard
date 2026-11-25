import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Sparkles,
  Sun,
  Moon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';

export default function AuthPage() {
  const { users, signIn, signUp } = useAuthStore();
  const { theme, toggleTheme } = useSettingsStore();

  const hasExistingUsers = users.length > 0;
  const [mode, setMode] = useState(hasExistingUsers ? 'signin' : 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(hasExistingUsers ? users[0]?.email || '' : '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setSubmitting(true);
      const res = await signUp({ name, email, password });
      setSubmitting(false);
      if (!res.success) {
        setError(res.error || 'Could not create account.');
      }
    } else {
      setSubmitting(true);
      const res = await signIn({ email, password });
      setSubmitting(false);
      if (!res.success) {
        setError(res.error || 'Invalid credentials.');
      }
    }
  };

  return (
    <div className="relative min-h-screen min-h-[100dvh] bg-gradient-to-br from-[#dce7f2] via-[#eaf1f8] to-[#d8e5f2] dark:from-[#0b101c] dark:via-[#0e1627] dark:to-[#080d18] text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 transition-colors duration-500 overflow-hidden">
      {/* Ambient Mesh Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 sm:w-[520px] sm:h-[520px] rounded-full bg-brand-teal/20 dark:bg-brand-teal/15 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-32 w-96 h-96 sm:w-[560px] sm:h-[560px] rounded-full bg-brand-purple/20 dark:bg-brand-purple/15 blur-[130px]" />
        <div className="absolute -bottom-32 left-[20%] w-96 h-96 sm:w-[480px] sm:h-[480px] rounded-full bg-brand-coral/15 dark:bg-brand-coral/10 blur-[120px]" />
      </div>

      {/* Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle color theme"
        className="fixed top-4 right-4 z-20 p-2.5 rounded-xl neu-pill-btn text-slate-700 dark:text-amber-300 shadow"
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 fill-amber-300" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700" />
        )}
      </button>

      {/* Main Auth Card */}
      <div className="relative z-10 w-full max-w-md clay-card p-5 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            BUILD LHS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {mode === 'signin'
              ? 'Sign in to access your study schedule & analytics'
              : 'Create your account to organize your study routine'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl neu-inset">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'signin'
                ? 'neu-teal-btn text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'signup'
                ? 'neu-teal-btn text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* First-time signup notice */}
        {mode === 'signup' && !hasExistingUsers && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            <span>
              Your existing tasks, subjects, routines, and study analytics will automatically be linked to this account.
            </span>
          </div>
        )}

        {/* Saved Profiles Quick Fill (on Sign In when accounts exist) */}
        {mode === 'signin' && users.length > 0 && (
          <div className="space-y-1.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Saved Accounts
            </span>
            <div className="flex flex-wrap gap-1.5">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setEmail(u.email);
                    setError('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    email.trim().toLowerCase() === u.email
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'neu-pill-btn text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>{u.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl neu-inset border border-white/60 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl neu-inset border border-white/60 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl neu-inset border border-white/60 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl neu-inset border border-white/60 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl neu-teal-btn text-xs sm:text-sm font-extrabold shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

