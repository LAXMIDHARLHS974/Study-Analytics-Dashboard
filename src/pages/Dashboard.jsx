import React from 'react';
import HeroBanner from '../components/dashboard/HeroBanner';
import StatCards from '../components/dashboard/StatCards';
import StudyOverviewChart from '../components/dashboard/StudyOverviewChart';
import SubjectDonutChart from '../components/dashboard/SubjectDonutChart';

export default function Dashboard({ onOpenNewTask }) {
  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* 1. Hero Shelf Banner */}
      <HeroBanner />

      {/* 2. Four Stat Cards */}
      <StatCards />

      {/* 3. Charts Section (Weekly Hours & Subject Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <StudyOverviewChart />
        </div>
        <div className="lg:col-span-5">
          <SubjectDonutChart />
        </div>
      </div>
    </div>
  );
}
