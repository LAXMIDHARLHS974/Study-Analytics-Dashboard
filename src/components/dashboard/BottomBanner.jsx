import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function BottomBanner() {
  const navigate = useNavigate();

  return (
    <div className="clay-card p-4 sm:p-5 flex items-center justify-between gap-4 border border-white/60 dark:border-slate-700/60 shadow-neu-card hover:shadow-xl transition-all">
      {/* Left: Star Mascot and Message */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 shadow-md">
          <img
            src="/assets/cute_star_mascot.jpg"
            alt="Cute Star Mascot"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-teal">
            <span>Discover New Habits</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
            Stay consistent! Every 25 minutes of deep focus builds your dream future.
          </p>
        </div>
      </div>

      {/* Right: Explore Button */}
      <button
        onClick={() => navigate('/goals')}
        className="neu-teal-btn px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold shadow-md shrink-0 flex items-center gap-1.5 active:scale-95 transition-all"
      >
        <span>Explore Goals</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
