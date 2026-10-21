import React from 'react';
import StudyOverviewChart from '../components/dashboard/StudyOverviewChart';
import CompletionTrendChart from '../components/charts/CompletionTrendChart';
import StudyHeatmap from '../components/charts/StudyHeatmap';

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* GitHub-style 365-Day Study Heatmap */}
      <StudyHeatmap />

      {/* Charts Grid: Weekly Bar Chart & Monthly Completion Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StudyOverviewChart />
        <CompletionTrendChart />
      </div>
    </div>
  );
}
