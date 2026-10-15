import { format, subDays, addDays } from 'date-fns';

const todayStr = format(new Date(), 'yyyy-MM-dd');
const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

export const INITIAL_SUBJECTS = [
  {
    id: 'subj-math',
    name: 'Mathematics',
    code: 'MATH-101',
    color: '#5FB3B3',
    icon: 'Calculator',
    targetHoursWeekly: 12,
    completedHoursThisWeek: 9.5,
    syllabusProgress: 78,
    totalChapters: 14,
    completedChapters: 11,
  },
  {
    id: 'subj-phys',
    name: 'Physics',
    code: 'PHYS-201',
    color: '#6A9AC4',
    icon: 'Atom',
    targetHoursWeekly: 10,
    completedHoursThisWeek: 8.2,
    syllabusProgress: 65,
    totalChapters: 16,
    completedChapters: 10,
  },
  {
    id: 'subj-cs',
    name: 'Computer Science',
    code: 'CS-301',
    color: '#7B7FBF',
    icon: 'Code2',
    targetHoursWeekly: 8,
    completedHoursThisWeek: 7.5,
    syllabusProgress: 84,
    totalChapters: 12,
    completedChapters: 10,
  },
  {
    id: 'subj-chem',
    name: 'Chemistry',
    code: 'CHEM-102',
    color: '#F6B26B',
    icon: 'FlaskConical',
    targetHoursWeekly: 6,
    completedHoursThisWeek: 4.8,
    syllabusProgress: 58,
    totalChapters: 15,
    completedChapters: 9,
  },
  {
    id: 'subj-eng',
    name: 'English Literature',
    code: 'ENG-105',
    color: '#4EBA88',
    icon: 'BookOpen',
    targetHoursWeekly: 4,
    completedHoursThisWeek: 3.5,
    syllabusProgress: 90,
    totalChapters: 10,
    completedChapters: 9,
  },
];

export const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Calculus: Integration by Parts Practice',
    description: 'Solve problem set 4.3 from textbook, questions 1 to 20.',
    subjectId: 'subj-math',
    subject: 'Mathematics',
    date: todayStr,
    startTime: '09:00',
    endTime: '10:30',
    duration: 90,
    priority: 'High',
    status: 'Done',
    repeat: 'none',
    reminder: true,
    completedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    goalId: 'goal-1',
  },
  {
    id: 'task-2',
    title: 'Thermodynamics Laws & Formula Sheet',
    description: 'Create concise revision mindmap for Carnot cycle and entropy formulas.',
    subjectId: 'subj-phys',
    subject: 'Physics',
    date: todayStr,
    startTime: '11:00',
    endTime: '12:15',
    duration: 75,
    priority: 'High',
    status: 'Done',
    repeat: 'none',
    reminder: true,
    completedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    goalId: 'goal-2',
  },
  {
    id: 'task-3',
    title: 'Data Structures: Graph Traversal (DFS/BFS)',
    description: 'Implement BFS & DFS algorithms in Python and solve 3 LeetCode problems.',
    subjectId: 'subj-cs',
    subject: 'Computer Science',
    date: todayStr,
    startTime: '14:00',
    endTime: '15:30',
    duration: 90,
    priority: 'Medium',
    status: 'In Progress',
    repeat: 'none',
    reminder: true,
    goalId: 'goal-3',
  },
  {
    id: 'task-4',
    title: 'Organic Chemistry: Carbonyl Reaction Mechanisms',
    description: 'Aldol condensation and Cannizzaro reaction step-by-step notes.',
    subjectId: 'subj-chem',
    subject: 'Chemistry',
    date: todayStr,
    startTime: '16:30',
    endTime: '17:45',
    duration: 75,
    priority: 'High',
    status: 'Todo',
    repeat: 'none',
    reminder: true,
    goalId: 'goal-1',
  },
  {
    id: 'task-5',
    title: 'English Literature Essay Outline on Hamlet',
    description: 'Structure theme analysis regarding soliloquy and dramatic irony.',
    subjectId: 'subj-eng',
    subject: 'English Literature',
    date: todayStr,
    startTime: '18:30',
    endTime: '19:15',
    duration: 45,
    priority: 'Low',
    status: 'Todo',
    repeat: 'none',
    reminder: false,
    goalId: null,
  },
  {
    id: 'task-6',
    title: 'Active Recall & Anki Flashcard Deck Review',
    description: 'Daily spaced repetition: 40 cards across Math, Physics, and Chemistry.',
    subjectId: 'subj-math',
    subject: 'Mathematics',
    date: todayStr,
    startTime: '20:30',
    endTime: '21:00',
    duration: 30,
    priority: 'Medium',
    status: 'Todo',
    repeat: 'daily',
    reminder: true,
    goalId: 'goal-1',
  },
  // Yesterday's completed tasks
  {
    id: 'task-7',
    title: 'Linear Algebra: Eigenvalues & Vector Spaces',
    description: 'Read chapter 5 notes and work through lecture examples.',
    subjectId: 'subj-math',
    subject: 'Mathematics',
    date: yesterdayStr,
    startTime: '10:00',
    endTime: '11:45',
    duration: 105,
    priority: 'High',
    status: 'Done',
    repeat: 'none',
    reminder: true,
    completedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    goalId: 'goal-1',
  },
  {
    id: 'task-8',
    title: 'Wave Optics: Young Double Slit Experiment',
    description: 'Derive fringe width equations and solve interference numericals.',
    subjectId: 'subj-phys',
    subject: 'Physics',
    date: yesterdayStr,
    startTime: '14:00',
    endTime: '15:30',
    duration: 90,
    priority: 'Medium',
    status: 'Done',
    repeat: 'none',
    reminder: true,
    completedAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    goalId: 'goal-2',
  },
  // Tomorrow's planned tasks
  {
    id: 'task-9',
    title: 'Electromagnetism: Faraday & Lenz Law Numerical Sets',
    description: 'Solve past exam questions 2021-2024.',
    subjectId: 'subj-phys',
    subject: 'Physics',
    date: tomorrowStr,
    startTime: '09:30',
    endTime: '11:00',
    duration: 90,
    priority: 'High',
    status: 'Todo',
    repeat: 'none',
    reminder: true,
    goalId: 'goal-2',
  },
  {
    id: 'task-10',
    title: 'Computer Science: SQL Database Joins & Indexing',
    description: 'Build practice schema and test query performance with EXPLAIN ANALYZE.',
    subjectId: 'subj-cs',
    subject: 'Computer Science',
    date: tomorrowStr,
    startTime: '14:00',
    endTime: '15:30',
    duration: 90,
    priority: 'Medium',
    status: 'Todo',
    repeat: 'none',
    reminder: false,
    goalId: 'goal-3',
  },
  {
    id: 'task-11',
    title: 'Coordinate Geometry: Conic Sections Review',
    description: 'Parabola and ellipse standard forms & focal chord properties.',
    subjectId: 'subj-math',
    subject: 'Mathematics',
    date: tomorrowStr,
    startTime: '16:30',
    endTime: '18:00',
    duration: 90,
    priority: 'High',
    status: 'Todo',
    repeat: 'none',
    reminder: true,
    goalId: 'goal-1',
  },
];

export const INITIAL_GOALS = [
  {
    id: 'goal-1',
    title: 'Score 95%+ in High School Board Exams',
    category: 'Academic',
    targetDate: '2027-03-31',
    color: '#5FB3B3',
    description: 'Consistent daily revision, solve 10 full length mock tests per subject.',
    progress: 74,
    linkedTasksCount: 16,
  },
  {
    id: 'goal-2',
    title: 'Complete AP Physics C Syllabus & Mock Papers',
    category: 'Exams',
    targetDate: '2027-05-15',
    color: '#6A9AC4',
    description: 'Master Mechanics, Electricity & Magnetism with deep conceptual clarity.',
    progress: 62,
    linkedTasksCount: 12,
  },
  {
    id: 'goal-3',
    title: 'Build 5 React & Data Science Portfolio Projects',
    category: 'Skills',
    targetDate: '2026-12-31',
    color: '#7B7FBF',
    description: 'Develop full stack web applications and machine learning demos.',
    progress: 80,
    linkedTasksCount: 8,
  },
  {
    id: 'goal-4',
    title: 'Read 12 STEM & Self-Improvement Books',
    category: 'Personal',
    targetDate: '2026-12-31',
    color: '#4EBA88',
    description: 'Atomic Habits, Feynman Lectures, Deep Work, Thinking Fast and Slow.',
    progress: 58,
    linkedTasksCount: 5,
  },
];

export const INITIAL_ROUTINES = [
  {
    id: 'routine-school-day',
    name: 'Weekday High-Focus Schedule',
    description: 'Balanced routine optimized for school days with 4.5 hours of dedicated self-study.',
    tag: 'School Days',
    blocks: [
      { id: 'b-1', time: '06:00', title: 'Wake Up, Hydrate & Light Stretch', duration: 30, type: 'Health', subject: 'General' },
      { id: 'b-2', time: '06:30', title: 'Morning Math Problem Solving', duration: 60, type: 'Study', subject: 'Mathematics' },
      { id: 'b-3', time: '08:00', title: 'School Lectures & Labs', duration: 360, type: 'School', subject: 'General' },
      { id: 'b-4', time: '15:30', title: 'Deep Work: Physics & Numerical Sets', duration: 90, type: 'Study', subject: 'Physics' },
      { id: 'b-5', time: '17:15', title: 'Active Break: Evening Walk / Snack', duration: 45, type: 'Break', subject: 'General' },
      { id: 'b-6', time: '18:15', title: 'Computer Science Coding Session', duration: 90, type: 'Study', subject: 'Computer Science' },
      { id: 'b-7', time: '20:15', title: 'Dinner & Family Time', duration: 60, type: 'Break', subject: 'General' },
      { id: 'b-8', time: '21:15', title: 'Spaced Repetition & Daily Review', duration: 45, type: 'Review', subject: 'Mathematics' },
    ],
  },
  {
    id: 'routine-weekend-deep',
    name: 'Weekend Deep Sprint',
    description: 'Immersive weekend study plan with a 3-hour mock exam and deep mistake analysis.',
    tag: 'Weekend Focus',
    blocks: [
      { id: 'wb-1', time: '07:30', title: 'Wake Up & Healthy Breakfast', duration: 45, type: 'Health', subject: 'General' },
      { id: 'wb-2', time: '08:30', title: 'Full 3-Hour Exam Simulation', duration: 180, type: 'Study', subject: 'Physics' },
      { id: 'wb-3', time: '12:00', title: 'Mistake Analysis & Correction Log', duration: 60, type: 'Review', subject: 'Physics' },
      { id: 'wb-4', time: '13:00', title: 'Lunch & Relaxing Music', duration: 60, type: 'Break', subject: 'General' },
      { id: 'wb-5', time: '14:30', title: 'Math Calculus & Algebra Marathon', duration: 120, type: 'Study', subject: 'Mathematics' },
      { id: 'wb-6', time: '17:00', title: 'Outdoor Sport / Workout', duration: 60, type: 'Health', subject: 'General' },
      { id: 'wb-7', time: '19:00', title: 'CS Project Coding & Git Commit', duration: 90, type: 'Study', subject: 'Computer Science' },
      { id: 'wb-8', time: '21:30', title: 'Book Reading & Wind Down', duration: 45, type: 'Personal', subject: 'General' },
    ],
  },
];

// Generate past 90 days study logs for the 365-day GitHub heatmap and analytics
export const generateSeedHeatmapLogs = () => {
  const logs = [];
  const now = new Date();
  
  // Seed past 120 days
  for (let i = 120; i >= 0; i--) {
    const day = subDays(now, i);
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayOfWeek = day.getDay(); // 0 is Sunday
    
    // Most days have study hours, occasional rest day
    let hours = 0;
    if (i === 0) {
      hours = 3.5; // Today so far
    } else if (i === 1) {
      hours = 5.2; // Yesterday
    } else if (dayOfWeek === 0) {
      hours = Math.random() > 0.3 ? Number((2.5 + Math.random() * 2.5).toFixed(1)) : 0;
    } else if (dayOfWeek === 6) {
      hours = Number((4.5 + Math.random() * 3).toFixed(1));
    } else {
      hours = Number((3.5 + Math.random() * 2.8).toFixed(1));
    }

    if (hours > 0) {
      logs.push({
        date: dateStr,
        hours,
        tasksCompleted: Math.min(6, Math.max(1, Math.round(hours * 0.9))),
        subjectBreakdown: {
          Mathematics: Number((hours * 0.35).toFixed(1)),
          Physics: Number((hours * 0.3).toFixed(1)),
          'Computer Science': Number((hours * 0.2).toFixed(1)),
          Chemistry: Number((hours * 0.15).toFixed(1)),
        }
      });
    }
  }
  return logs;
};

export const INITIAL_TIMER_LOGS = generateSeedHeatmapLogs();

// Weekly study data for the Bar Chart
export const INITIAL_WEEKLY_HOURS = [
  { day: 'Mon', hours: 4.8, target: 5.0, math: 1.8, physics: 1.5, cs: 1.5 },
  { day: 'Tue', hours: 5.5, target: 5.0, math: 2.0, physics: 1.8, cs: 1.7 },
  { day: 'Wed', hours: 6.2, target: 5.0, math: 2.2, physics: 2.2, cs: 1.8 },
  { day: 'Thu', hours: 5.0, target: 5.0, math: 1.8, physics: 1.6, cs: 1.6 },
  { day: 'Fri', hours: 5.8, target: 5.0, math: 2.0, physics: 2.0, cs: 1.8 },
  { day: 'Sat', hours: 6.5, target: 6.0, math: 2.5, physics: 2.2, cs: 1.8 },
  { day: 'Sun', hours: 3.6, target: 4.0, math: 1.5, physics: 1.2, cs: 0.9 },
];

export const INITIAL_MONTHS_PLAN = [
  { id: 1, name: 'January', targetHours: 120, loggedHours: 125, milestone: 'Calculus Ch 1-4 & Physics Mechanics', status: 'Completed', progress: 100 },
  { id: 2, name: 'February', targetHours: 130, loggedHours: 134, milestone: 'Thermodynamics & Organic Chemistry Basics', status: 'Completed', progress: 100 },
  { id: 3, name: 'March', targetHours: 140, loggedHours: 142, milestone: 'Midterm Board Exam Revision & 10 Mock Tests', status: 'Completed', progress: 100 },
  { id: 4, name: 'April', targetHours: 130, loggedHours: 128, milestone: 'Data Structures & Algorithms in Python', status: 'Completed', progress: 98 },
  { id: 5, name: 'May', targetHours: 140, loggedHours: 135, milestone: 'AP Physics C Full Exam & Numerical Marathon', status: 'Completed', progress: 96 },
  { id: 6, name: 'June', targetHours: 110, loggedHours: 115, milestone: 'Electromagnetism & Wave Optics Intro', status: 'Completed', progress: 100 },
  { id: 7, name: 'July', targetHours: 130, loggedHours: 122, milestone: 'Chemical Kinetics & Coordination Compounds', status: 'Completed', progress: 94 },
  { id: 8, name: 'August', targetHours: 140, loggedHours: 138, milestone: 'React Web Portfolio & CS Final Project', status: 'Completed', progress: 98 },
  { id: 9, name: 'September', targetHours: 135, loggedHours: 130, milestone: 'Differential Equations & Probability Review', status: 'Completed', progress: 96 },
  { id: 10, name: 'October', targetHours: 140, loggedHours: 112, milestone: 'Full Syllabus First Pass & Weak Topic Drills', status: 'In Progress', progress: 80 },
  { id: 11, name: 'November', targetHours: 150, loggedHours: 0, milestone: 'Past 10 Years Question Papers Simulation', status: 'Upcoming', progress: 0 },
  { id: 12, name: 'December', targetHours: 150, loggedHours: 0, milestone: 'Final Mock Test Blitz & Formula Mastery', status: 'Upcoming', progress: 0 },
];
