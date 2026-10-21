import React, { useState } from 'react';
import { Flame, Quote, RefreshCw } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { calculateStreak } from '../../utils/studyStats';

const MOTIVATIONAL_QUOTES = [
  {
    quote: "Discipline will take you places where motivation can't.",
    author: "Study Mindset",
    tag: "Daily Discipline",
  },
  {
    quote: "The secret to getting ahead is getting started. Small daily steps compound into massive success.",
    author: "Mark Twain",
    tag: "Momentum",
  },
  {
    quote: "Your future self will thank you for the hard work you put in today.",
    author: "Focus Habit",
    tag: "Consistency",
  },
  {
    quote: "It's not about being the smartest in the room; it's about being the most consistent.",
    author: "Deep Work",
    tag: "Perseverance",
  },
  {
    quote: "Push yourself, because no one else is going to do it for you.",
    author: "Excellence",
    tag: "Dedication",
  },
  {
    quote: "Don't count the days, make the days count.",
    author: "Muhammad Ali",
    tag: "Focus",
  },
  {
    quote: "Action breeds confidence and courage. Sit down, eliminate distractions, and conquer the work.",
    author: "Dale Carnegie",
    tag: "Action",
  },
];

export default function HeroBanner() {
  const { tasks, timerLogs } = useTaskStore();
  const { currentStreak, studiedToday } = calculateStreak(timerLogs, tasks);

  const [quoteIndex, setQuoteIndex] = useState(0);
  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex];

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl clay-card p-3.5 sm:p-6 shadow-neu-card border border-white/60 dark:border-slate-700/60 transition-all">
      {/* Background soft ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/10 via-transparent to-teal-500/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        {/* Left: Inspiring 3D Motivational Study Photo */}
        <div className="relative w-full md:w-5/12 max-w-sm rounded-xl overflow-hidden shadow-md group">
          <img
            src="/assets/motivational_study.jpg"
            alt="Discipline Beats Motivation - Study Setup"
            className="w-full h-44 sm:h-52 md:h-56 object-cover rounded-xl group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>

        {/* Right: Motivational Text & Mindset Card */}
        <div className="flex-1 w-full text-center md:text-left space-y-3 sm:space-y-4">
          {/* Streak Status Badge */}
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
              <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
              <span>
                {currentStreak}-Day Study Streak {studiedToday ? 'Active 🔥' : currentStreak > 0 ? 'On Track ⚡' : 'Start Today ✨'}
              </span>
            </div>
          </div>

          {/* Motivational Quote Block */}
          <div className="relative p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/80 dark:border-slate-700/60 shadow-sm">
            <Quote className="w-6 h-6 text-teal-500/40 mb-2" />
            <blockquote className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 dark:text-white leading-snug tracking-tight italic">
              "{currentQuote.quote}"
            </blockquote>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <span className="font-semibold text-teal-600 dark:text-teal-400">
                — {currentQuote.author}
              </span>

              <button
                type="button"
                onClick={handleNextQuote}
                className="neu-pill-btn px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-300 flex items-center gap-1.5 active:scale-95 transition-all"
                title="View another motivational quote"
              >
                <RefreshCw className="w-3 h-3" />
                <span>New Quote</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
