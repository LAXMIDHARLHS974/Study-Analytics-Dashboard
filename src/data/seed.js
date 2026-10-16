import { format } from 'date-fns';

const todayStr = format(new Date(), 'yyyy-MM-dd');

// Genuine subjects added by the user (DSA, English, Backend) with zero fake study hours
export const INITIAL_SUBJECTS = [
  {
    id: 'subj-dsa',
    name: 'DSA',
    code: 'DSA',
    color: '#7B7FBF',
    icon: 'Code2',
    targetHoursWeekly: 8,
    completedHoursThisWeek: 0,
    syllabusProgress: 0,
    totalChapters: 10,
    completedChapters: 0,
  },
  {
    id: 'subj-english',
    name: 'English',
    code: 'ENG',
    color: '#4EBA88',
    icon: 'BookOpen',
    targetHoursWeekly: 4,
    completedHoursThisWeek: 0,
    syllabusProgress: 0,
    totalChapters: 10,
    completedChapters: 0,
  },
  {
    id: 'subj-backend',
    name: 'Backend',
    code: 'BACK',
    color: '#52A5B5',
    icon: 'Layers',
    targetHoursWeekly: 10,
    completedHoursThisWeek: 0,
    syllabusProgress: 0,
    totalChapters: 12,
    completedChapters: 0,
  },
];

// Genuine tasks added by the user (JDBC 150m)
export const INITIAL_TASKS = [
  {
    id: 'task-jdbc',
    title: 'JDBC',
    description: 'Java Database Connectivity practice queries & prep',
    subjectId: 'subj-backend',
    subject: 'Backend',
    date: todayStr,
    startTime: '10:00',
    endTime: '12:30',
    duration: 150,
    priority: 'High',
    status: 'Todo',
    repeat: 'none',
    reminder: true,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_GOALS = [];

export const INITIAL_ROUTINES = [
  {
    id: 'routine-default',
    name: 'Daily Focus Routine',
    description: 'Structured daily routine for consistent study focus.',
    tag: 'Daily Routine',
    blocks: [
      { id: 'b-1', time: '08:00', title: 'Morning Focus Block', duration: 90, type: 'Study', subject: 'DSA' },
      { id: 'b-2', time: '14:00', title: 'Afternoon Deep Work', duration: 150, type: 'Study', subject: 'Backend' },
      { id: 'b-3', time: '18:00', title: 'Evening Review Block', duration: 45, type: 'Review', subject: 'English' },
    ],
  },
];

// Clean timer logs with daily visit recorded for today
export const INITIAL_TIMER_LOGS = [
  {
    date: todayStr,
    hours: 0,
    tasksCompleted: 0,
    visited: true,
    subjectBreakdown: {},
  },
];

export const INITIAL_WEEKLY_HOURS = [];

export const INITIAL_MONTHS_PLAN = [
  { id: 1, name: 'January', targetHours: 120, loggedHours: 0, milestone: 'Monthly Goal & Focus', status: 'Upcoming', progress: 0 },
  { id: 2, name: 'February', targetHours: 120, loggedHours: 0, milestone: 'Monthly Goal & Focus', status: 'Upcoming', progress: 0 },
  { id: 3, name: 'March', targetHours: 120, loggedHours: 0, milestone: 'Monthly Goal & Focus', status: 'Upcoming', progress: 0 },
  { id: 4, name: 'April', targetHours: 120, loggedHours: 0, milestone: 'Monthly Goal & Focus', status: 'Upcoming', progress: 0 },
  { id: 5, name: 'May', targetHours: 120, loggedHours: 0, milestone: 'Monthly Goal & Focus', status: 'Upcoming', progress: 0 },
  { id: 6, name: 'June', targetHours: 120, loggedHours: 0, milestone: 'Monthly Goal & Focus', status: 'Upcoming', progress: 0 },
  { id: 7, name: 'July', targetHours: 120, loggedHours: 0, milestone: 'Monthly Goal & Focus', status: 'Upcoming', progress: 0 },
  { id: 8, name: 'August', targetHours: 120, loggedHours: 0, milestone: 'Monthly Goal & Focus', status: 'Upcoming', progress: 0 },
  { id: 9, name: 'September', targetHours: 120, loggedHours: 0, milestone: 'Monthly Goal & Focus', status: 'Upcoming', progress: 0 },
  { id: 10, name: 'October', targetHours: 120, loggedHours: 0, milestone: 'Monthly Goal & Focus', status: 'Upcoming', progress: 0 },
  { id: 11, name: 'November', targetHours: 120, loggedHours: 0, milestone: 'Monthly Goal & Focus', status: 'Upcoming', progress: 0 },
  { id: 12, name: 'December', targetHours: 120, loggedHours: 0, milestone: 'Monthly Goal & Focus', status: 'Upcoming', progress: 0 },
];
