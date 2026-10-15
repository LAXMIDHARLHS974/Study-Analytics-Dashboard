import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import StudyOverviewChart from '../components/dashboard/StudyOverviewChart';
import SubjectDonutChart from '../components/dashboard/SubjectDonutChart';
import CompletionTrendChart from '../components/charts/CompletionTrendChart';
import StudyHeatmap from '../components/charts/StudyHeatmap';

export default function Analytics() {
  const { subjects } = useTaskStore();

  return (
    <div className="space-y-6">
      {/* GitHub-style 365-Day Study Heatmap */}
      <StudyHeatmap />

      {/* Charts Grid: Weekly Bar Chart & Monthly Completion Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StudyOverviewChart />
        <CompletionTrendChart />
      </div>

      {/* Subject Distribution & Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <SubjectDonutChart />
        </div>

        <div className="lg:col-span-7">
          <div className="clay-card p-5 h-full flex flex-col justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white mb-3">
              Subject Focus Breakdown
            </h3>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {subjects.map((subj) => (
                <div
                  key={subj.id}
                  className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/80 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-md"
                      style={{ backgroundColor: subj.color }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                        {subj.name}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Target: {subj.targetHoursWeekly}h / week
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                      {subj.completedHoursThisWeek} hrs
                    </span>
                    <span className="block text-[10px] font-bold text-brand-teal">
                      {subj.syllabusProgress}% Syllabus Done
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
