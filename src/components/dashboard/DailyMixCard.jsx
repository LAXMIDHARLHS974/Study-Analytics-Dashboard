import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, ArrowRight } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';

export default function DailyMixCard() {
  const navigate = useNavigate();
  const { routines } = useTaskStore();

  const routine = routines[0] || {
    name: 'Weekday High-Focus Schedule',
    blocks: [1, 2, 3, 4, 5, 6],
  };

  return (
    <div className="clay-card p-4 sm:p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">
          Daily Mix
        </h3>
        <button
          onClick={() => navigate('/routine')}
          className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-0.5 neu-pill-btn px-2.5 py-1"
        >
          <span>See All</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Cozy Study Room Banner (matching screenshot armchair image) */}
      <div className="relative rounded-2xl overflow-hidden shadow-md group flex-1 min-h-[140px] flex flex-col justify-end p-4">
        <img
          src="/assets/cozy_study_nook.jpg"
          alt="Cozy Study Room Nook"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

        <div className="relative z-10 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-teal/80 text-white backdrop-blur-sm mb-1 inline-block">
              Daily Mix Routine
            </span>
            <h4 className="text-white font-extrabold text-sm sm:text-base leading-tight">
              Chill Study Vibes
            </h4>
            <p className="text-[11px] text-slate-300 font-medium">
              {routine.blocks.length} focus blocks scheduled
            </p>
          </div>

          <button
            onClick={() => navigate('/routine')}
            className="w-10 h-10 rounded-full bg-brand-teal hover:bg-brand-teal/90 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all group-hover:scale-110"
            title="Open Daily Routine"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
