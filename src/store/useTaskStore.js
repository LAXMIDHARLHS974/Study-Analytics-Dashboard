import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, isBefore, parseISO, startOfDay, addDays } from 'date-fns';
import { 
  INITIAL_TASKS, 
  INITIAL_SUBJECTS, 
  INITIAL_GOALS, 
  INITIAL_ROUTINES, 
  INITIAL_TIMER_LOGS,
  INITIAL_MONTHS_PLAN
} from '../data/seed';

const LEGACY_DEMO_SUBJECT_NAMES = new Set([
  'mathematics',
  'physics',
  'computer science',
  'computer sci',
  'chemistry',
]);

const FAKE_TASK_IDS = new Set([
  'task-1', 'task-2', 'task-3', 'task-4', 'task-5', 'task-6', 'task-7', 'task-8', 'task-9', 'task-10', 'task-11'
]);

// Auto-sanitizer that removes fake demo data, deduplicates subjects, and canonicalizes task & log subjects
export const sanitizeStoreState = (rawState) => {
  if (!rawState) return rawState;
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Filter out legacy fake subjects and deduplicate remaining subjects case-insensitively
  const subjectMap = new Map();
  (rawState.subjects || []).forEach((s) => {
    if (!s || !s.name) return;
    const cleanName = s.name.trim();
    const key = cleanName.toLowerCase();
    if (LEGACY_DEMO_SUBJECT_NAMES.has(key)) return;

    if (!subjectMap.has(key)) {
      subjectMap.set(key, { ...s, name: cleanName });
    } else {
      // Merge completed weekly hours into the canonical entry
      const existing = subjectMap.get(key);
      subjectMap.set(key, {
        ...existing,
        completedHoursThisWeek: Number(
          ((existing.completedHoursThisWeek || 0) + (s.completedHoursThisWeek || 0)).toFixed(1)
        ),
      });
    }
  });

  let cleanSubjects = Array.from(subjectMap.values());
  if (cleanSubjects.length === 0) {
    cleanSubjects = INITIAL_SUBJECTS;
  }

  // Filter out fake tasks & normalize task subjects to match canonical subjects
  let cleanTasks = (rawState.tasks || [])
    .filter((t) => {
      if (!t) return false;
      if (FAKE_TASK_IDS.has(t.id)) return false;
      if (t.subject && LEGACY_DEMO_SUBJECT_NAMES.has(t.subject.trim().toLowerCase())) return false;
      return true;
    })
    .map((t) => {
      const match = cleanSubjects.find(
        (s) => s.id === t.subjectId || s.name.toLowerCase() === (t.subject || '').trim().toLowerCase()
      );
      if (match) {
        return { ...t, subject: match.name, subjectId: match.id };
      }
      return t;
    });

  if (cleanTasks.length === 0) {
    cleanTasks = INITIAL_TASKS;
  }

  // Clean timerLogs (strip fake subjects and merge duplicate casing keys)
  let cleanLogs = (rawState.timerLogs || [])
    .map((log) => {
      if (!log) return null;
      const cleanBreakdown = {};
      let cleanHours = 0;
      if (log.subjectBreakdown && typeof log.subjectBreakdown === 'object') {
        Object.entries(log.subjectBreakdown).forEach(([name, hours]) => {
          const key = (name || '').trim().toLowerCase();
          if (!LEGACY_DEMO_SUBJECT_NAMES.has(key)) {
            const match = cleanSubjects.find((s) => s.name.toLowerCase() === key);
            const canonicalName = match ? match.name : name.trim();
            const h = Number(hours) || 0;
            cleanBreakdown[canonicalName] = Number(((cleanBreakdown[canonicalName] || 0) + h).toFixed(2));
            cleanHours += h;
          }
        });
      }
      if (cleanHours === 0 && !log.tasksCompleted && !log.visited) {
        return null;
      }
      return {
        ...log,
        hours: Number(cleanHours.toFixed(2)),
        subjectBreakdown: cleanBreakdown,
      };
    })
    .filter(Boolean);

  // Ensure daily visit for today is recorded
  const todayIdx = cleanLogs.findIndex((l) => l.date === todayStr);
  if (todayIdx >= 0) {
    cleanLogs[todayIdx] = { ...cleanLogs[todayIdx], visited: true };
  } else {
    cleanLogs.push({
      date: todayStr,
      hours: 0,
      tasksCompleted: 0,
      visited: true,
      subjectBreakdown: {},
    });
  }

  // Ensure routines do not have fake subjects
  let cleanRoutines = rawState.routines || INITIAL_ROUTINES;
  if (Array.isArray(cleanRoutines)) {
    cleanRoutines = cleanRoutines.map((r) => {
      if (!r || !Array.isArray(r.blocks)) return r;
      return {
        ...r,
        blocks: r.blocks.map((b) => {
          const lower = (b.subject || '').trim().toLowerCase();
          if (LEGACY_DEMO_SUBJECT_NAMES.has(lower)) {
            return { ...b, subject: cleanSubjects[0]?.name || 'DSA' };
          }
          const match = cleanSubjects.find((s) => s.name.toLowerCase() === lower);
          if (match) {
            return { ...b, subject: match.name };
          }
          return b;
        }),
      };
    });
  }

  // Ensure completed/progressed yearly plan months reflect genuine logged hours
  let cleanYearlyPlan = rawState.yearlyPlan;
  if (Array.isArray(cleanYearlyPlan)) {
    cleanYearlyPlan = cleanYearlyPlan.map((m) => {
      if (!m) return m;
      let logged = Number(m.loggedHours) || 0;
      const progress = Number(m.progress) || 0;
      const target = Number(m.targetHours) || 120;
      if (logged === 0 && progress > 0) {
        logged = Math.round(target * (progress / 100));
      }
      return {
        ...m,
        targetHours: target,
        loggedHours: logged,
      };
    });
  }

  return {
    ...rawState,
    subjects: cleanSubjects,
    tasks: cleanTasks,
    routines: cleanRoutines,
    timerLogs: cleanLogs,
    yearlyPlan: cleanYearlyPlan || rawState.yearlyPlan,
  };
};

// Immediately sanitize localStorage in the browser
if (typeof window !== 'undefined' && window.localStorage) {
  ['build-lhs-v1', 'build-lhs-genuine-v1'].forEach((key) => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed && parsed.state) {
          const sanitized = sanitizeStoreState(parsed.state);
          window.localStorage.setItem(key, JSON.stringify({ ...parsed, state: sanitized }));
        }
      }
    } catch {
      // ignore
    }
  });

  // Also clean build-lhs-settings-v1 of legacy fake subject defaults
  try {
    const settingsItem = window.localStorage.getItem('build-lhs-settings-v1');
    if (settingsItem) {
      const parsedSettings = JSON.parse(settingsItem);
      if (parsedSettings && parsedSettings.state) {
        const lower = (parsedSettings.state.activeSubject || '').trim().toLowerCase();
        if (!parsedSettings.state.activeSubject || LEGACY_DEMO_SUBJECT_NAMES.has(lower)) {
          parsedSettings.state.activeSubject = 'DSA';
          window.localStorage.setItem('build-lhs-settings-v1', JSON.stringify(parsedSettings));
        }
      }
    }
  } catch {
    // ignore
  }
}

export const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: INITIAL_TASKS,
      subjects: INITIAL_SUBJECTS,
      goals: INITIAL_GOALS,
      routines: INITIAL_ROUTINES,
      timerLogs: INITIAL_TIMER_LOGS,
      yearlyPlan: INITIAL_MONTHS_PLAN,
      
      // Filter & UI states
      filterSubject: 'all',
      filterPriority: 'all',
      filterStatus: 'all',
      sortBy: 'time', // 'time' | 'priority' | 'title' | 'duration'

      // Actions for filters
      setFilterSubject: (subject) => set({ filterSubject: subject }),
      setFilterPriority: (priority) => set({ filterPriority: priority }),
      setFilterStatus: (status) => set({ filterStatus: status }),
      setSortBy: (sortBy) => set({ sortBy }),

      // Task actions
      addTask: (newTask) => {
        const id = `task-${Date.now()}`;
        const rawSubj = (newTask.subject || '').trim();
        let subjId = newTask.subjectId;

        let updatedSubjects = [...get().subjects];
        
        // Find existing subject by ID or case-insensitive name
        let existingSubject = null;
        if (subjId) {
          existingSubject = updatedSubjects.find((s) => s.id === subjId);
        }
        if (!existingSubject && rawSubj) {
          existingSubject = updatedSubjects.find(
            (s) => s.name.toLowerCase() === rawSubj.toLowerCase()
          );
        }

        let subjName = rawSubj || 'General';

        if (existingSubject) {
          subjId = existingSubject.id;
          subjName = existingSubject.name; // Use canonical existing subject casing
        } else if (rawSubj && rawSubj.toLowerCase() !== 'general') {
          subjId = `subj-${Date.now()}`;
          const newSubjObj = {
            id: subjId,
            name: rawSubj,
            code: rawSubj.substring(0, 4).toUpperCase(),
            color: '#5FB3B3',
            icon: 'BookOpen',
            targetHoursWeekly: 8,
            completedHoursThisWeek: 0,
            syllabusProgress: 0,
            totalChapters: 10,
            completedChapters: 0,
          };
          updatedSubjects.push(newSubjObj);
        } else {
          subjName = updatedSubjects[0]?.name || 'General';
          subjId = updatedSubjects[0]?.id || 'subj-general';
        }

        const task = {
          id,
          title: newTask.title || 'Untitled Study Task',
          description: newTask.description || '',
          subjectId: subjId,
          subject: subjName,
          date: newTask.date || format(new Date(), 'yyyy-MM-dd'),
          startTime: newTask.startTime || '10:00',
          endTime: newTask.endTime || '11:00',
          duration: Number(newTask.duration) || 60,
          priority: newTask.priority || 'Medium',
          status: newTask.status || 'Todo',
          repeat: newTask.repeat || 'none',
          reminder: Boolean(newTask.reminder),
          goalId: newTask.goalId || null,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          tasks: [task, ...state.tasks],
          subjects: updatedSubjects,
        }));
        return task;
      },

      updateTask: (id, updates) => {
        set((state) => {
          let canonicalUpdates = { ...updates };
          if (updates.subject || updates.subjectId) {
            const rawSubj = (updates.subject || '').trim().toLowerCase();
            const existing = state.subjects.find(
              (s) => s.id === updates.subjectId || (rawSubj && s.name.toLowerCase() === rawSubj)
            );
            if (existing) {
              canonicalUpdates.subject = existing.name;
              canonicalUpdates.subjectId = existing.id;
            }
          }
          return {
            tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...canonicalUpdates } : t)),
          };
        });
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      duplicateTask: (id) => {
        const original = get().tasks.find((t) => t.id === id);
        if (!original) return;
        const duplicate = {
          ...original,
          id: `task-${Date.now()}`,
          title: `${original.title} (Copy)`,
          status: 'Todo',
          completedAt: null,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tasks: [duplicate, ...state.tasks],
        }));
      },

      toggleTaskStatus: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return false;

        const nextStatus = task.status === 'Done' ? 'Todo' : 'Done';
        const completedAt = nextStatus === 'Done' ? new Date().toISOString() : null;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: nextStatus, completedAt } : t
          ),
        }));

        // If completed or uncompleted, record/update study log and subject hours
        get().recordTaskCompletion(task, nextStatus === 'Done');
        return nextStatus === 'Done';
      },

      reorderTasks: (newTasksList) => {
        set({ tasks: newTasksList });
      },

      // Carry forward overdue tasks to tomorrow or today
      carryForwardOverdueTasks: (targetDate = format(new Date(), 'yyyy-MM-dd')) => {
        const today = startOfDay(new Date());
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.status !== 'Done') {
              const taskDate = parseISO(task.date);
              if (isBefore(taskDate, today)) {
                return { ...task, date: targetDate };
              }
            }
            return task;
          }),
        }));
      },

      // Subject actions
      addSubject: (newSubject) => {
        const rawName = (newSubject.name || '').trim();
        if (!rawName) return;

        const currentSubjects = get().subjects;
        const existing = currentSubjects.find(
          (s) => s.name.toLowerCase() === rawName.toLowerCase()
        );

        if (existing) {
          // Subject with this name already exists: update details instead of duplicating
          set((state) => ({
            subjects: state.subjects.map((s) =>
              s.id === existing.id
                ? {
                    ...s,
                    code: newSubject.code || s.code,
                    color: newSubject.color || s.color,
                    targetHoursWeekly: Number(newSubject.targetHoursWeekly) || s.targetHoursWeekly,
                    totalChapters: Number(newSubject.totalChapters) || s.totalChapters,
                  }
                : s
            ),
          }));
          return;
        }

        const id = `subj-${Date.now()}`;
        const subject = {
          id,
          name: rawName,
          code: newSubject.code || rawName.substring(0, 4).toUpperCase(),
          color: newSubject.color || '#5FB3B3',
          icon: newSubject.icon || 'BookOpen',
          targetHoursWeekly: Number(newSubject.targetHoursWeekly) || 8,
          completedHoursThisWeek: 0,
          syllabusProgress: Number(newSubject.syllabusProgress) || 0,
          totalChapters: Number(newSubject.totalChapters) || 10,
          completedChapters: Number(newSubject.completedChapters) || 0,
        };
        set((state) => ({
          subjects: [...state.subjects, subject],
        }));
      },

      updateSubject: (id, updates) => {
        set((state) => ({
          subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
      },

      deleteSubject: (id) => {
        const target = get().subjects.find((s) => s.id === id);
        const targetName = target ? target.name.toLowerCase() : '';
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
          tasks: state.tasks.filter(
            (t) => t.subjectId !== id && (t.subject || '').trim().toLowerCase() !== targetName
          ),
        }));
      },

      // Goal actions
      addGoal: (newGoal) => {
        const id = `goal-${Date.now()}`;
        const goal = {
          id,
          title: newGoal.title,
          category: newGoal.category || 'Academic',
          targetDate: newGoal.targetDate || format(addDays(new Date(), 90), 'yyyy-MM-dd'),
          color: newGoal.color || '#5FB3B3',
          description: newGoal.description || '',
          progress: Number(newGoal.progress) || 0,
          linkedTasksCount: 0,
        };
        set((state) => ({
          goals: [...state.goals, goal],
        }));
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        }));
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));
      },

      // Routine actions
      addRoutine: (newRoutine) => {
        const id = `routine-${Date.now()}`;
        const routine = {
          id,
          name: newRoutine.name,
          description: newRoutine.description || '',
          tag: newRoutine.tag || 'Daily Schedule',
          blocks: newRoutine.blocks || [],
        };
        set((state) => ({
          routines: [...state.routines, routine],
        }));
      },

      updateRoutine: (id, updates) => {
        set((state) => ({
          routines: state.routines.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
      },

      deleteRoutine: (id) => {
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
        }));
      },

      addRoutineBlock: (routineId, newBlock) => {
        const blockId = `block-${Date.now()}`;
        const block = {
          id: blockId,
          time: newBlock.time || '08:00',
          title: newBlock.title || 'Focus Study Block',
          duration: Number(newBlock.duration) || 60,
          type: newBlock.type || 'Study',
          subject: newBlock.subject || get().subjects[0]?.name || 'General',
        };
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === routineId ? { ...r, blocks: [...r.blocks, block] } : r
          ),
        }));
      },

      updateRoutineBlock: (routineId, blockId, updates) => {
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === routineId
              ? {
                  ...r,
                  blocks: r.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
                }
              : r
          ),
        }));
      },

      deleteRoutineBlock: (routineId, blockId) => {
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === routineId
              ? {
                  ...r,
                  blocks: r.blocks.filter((b) => b.id !== blockId),
                }
              : r
          ),
        }));
      },

      // Yearly Plan actions
      updateMonthPlan: (monthId, updates) => {
        set((state) => ({
          yearlyPlan: (state.yearlyPlan || INITIAL_MONTHS_PLAN).map((m) =>
            m.id === monthId ? { ...m, ...updates } : m
          ),
        }));
      },

      // One-click apply routine to date (creates study tasks from routine blocks)
      applyRoutineToDate: (routineId, targetDateStr) => {
        const routine = get().routines.find((r) => r.id === routineId);
        if (!routine) return;

        const newGeneratedTasks = routine.blocks
          .filter((block) => block.type === 'Study' || block.type === 'Review')
          .map((block, idx) => {
            const subjectObj = get().subjects.find(
              (s) => s.name.toLowerCase() === (block.subject || '').trim().toLowerCase()
            ) || get().subjects[0];
            return {
              id: `task-routine-${Date.now()}-${idx}`,
              title: block.title,
              description: `Generated from template "${routine.name}"`,
              subjectId: subjectObj ? subjectObj.id : 'subj-general',
              subject: subjectObj ? subjectObj.name : (block.subject || 'General'),
              date: targetDateStr,
              startTime: block.time,
              endTime: block.time, // can be calculated
              duration: block.duration || 60,
              priority: 'Medium',
              status: 'Todo',
              repeat: 'none',
              reminder: true,
              createdAt: new Date().toISOString(),
            };
          });

        set((state) => ({
          tasks: [...newGeneratedTasks, ...state.tasks],
        }));
        return newGeneratedTasks.length;
      },

      // Log study session or manual entry
      logStudySession: ({ subjectName, durationMinutes, taskId }) => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const hoursToAdd = Number((durationMinutes / 60).toFixed(2));
        const cleanSubjName = (subjectName || '').trim();

        set((state) => {
          let updatedSubjects = [...state.subjects];
          const subjIdx = updatedSubjects.findIndex(
            (s) => s.name.toLowerCase() === cleanSubjName.toLowerCase()
          );

          let canonicalName = cleanSubjName;
          if (subjIdx >= 0) {
            canonicalName = updatedSubjects[subjIdx].name;
            updatedSubjects[subjIdx] = {
              ...updatedSubjects[subjIdx],
              completedHoursThisWeek: Number(
                ((updatedSubjects[subjIdx].completedHoursThisWeek || 0) + hoursToAdd).toFixed(1)
              ),
            };
          } else if (cleanSubjName && cleanSubjName.toLowerCase() !== 'general') {
            updatedSubjects.push({
              id: `subj-${Date.now()}`,
              name: cleanSubjName,
              code: cleanSubjName.substring(0, 4).toUpperCase(),
              color: '#5FB3B3',
              icon: 'BookOpen',
              targetHoursWeekly: 8,
              completedHoursThisWeek: hoursToAdd,
              syllabusProgress: 0,
              totalChapters: 10,
              completedChapters: 0,
            });
          } else {
            canonicalName = updatedSubjects[0]?.name || 'General';
          }

          const existingLogIndex = state.timerLogs.findIndex((log) => log.date === todayStr);
          let updatedLogs = [...state.timerLogs];

          if (existingLogIndex >= 0) {
            const current = updatedLogs[existingLogIndex];
            const breakdown = { ...(current.subjectBreakdown || {}) };
            let existingHours = 0;

            // Merge any existing casing keys into canonicalName
            Object.keys(breakdown).forEach((k) => {
              if (k.toLowerCase() === canonicalName.toLowerCase()) {
                existingHours += Number(breakdown[k]) || 0;
                delete breakdown[k];
              }
            });

            breakdown[canonicalName] = Number((existingHours + hoursToAdd).toFixed(2));

            updatedLogs[existingLogIndex] = {
              ...current,
              hours: Number(((current.hours || 0) + hoursToAdd).toFixed(2)),
              subjectBreakdown: breakdown,
            };
          } else {
            updatedLogs.push({
              date: todayStr,
              hours: hoursToAdd,
              tasksCompleted: 0,
              subjectBreakdown: {
                [canonicalName]: hoursToAdd,
              },
            });
          }

          return {
            timerLogs: updatedLogs,
            subjects: updatedSubjects,
          };
        });
      },

      recordTaskCompletion: (task, isCompleting = true) => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const taskHours = Number(((task.duration || 60) / 60).toFixed(2));

        // Find canonical subject name
        const stateSubjects = get().subjects;
        const matchedSubj = stateSubjects.find(
          (s) => s.id === task.subjectId || s.name.toLowerCase() === (task.subject || '').trim().toLowerCase()
        );
        const subjName = matchedSubj ? matchedSubj.name : (task.subject || 'General');

        set((state) => {
          const logIdx = state.timerLogs.findIndex((l) => l.date === todayStr);
          let updatedLogs = [...state.timerLogs];

          if (isCompleting) {
            if (logIdx >= 0) {
              const current = updatedLogs[logIdx];
              const breakdown = { ...(current.subjectBreakdown || {}) };
              let curSubj = 0;

              // Merge any case variants into subjName
              Object.keys(breakdown).forEach((k) => {
                if (k.toLowerCase() === subjName.toLowerCase()) {
                  curSubj += Number(breakdown[k]) || 0;
                  delete breakdown[k];
                }
              });

              breakdown[subjName] = Number((curSubj + taskHours).toFixed(2));

              updatedLogs[logIdx] = {
                ...current,
                hours: Number(((current.hours || 0) + taskHours).toFixed(2)),
                tasksCompleted: (current.tasksCompleted || 0) + 1,
                subjectBreakdown: breakdown,
              };
            } else {
              updatedLogs.push({
                date: todayStr,
                hours: taskHours,
                tasksCompleted: 1,
                subjectBreakdown: {
                  [subjName]: taskHours,
                },
              });
            }

            const updatedSubjects = state.subjects.map((s) => {
              if (s.name.toLowerCase() === subjName.toLowerCase() || s.id === task.subjectId) {
                return {
                  ...s,
                  completedHoursThisWeek: Number(((s.completedHoursThisWeek || 0) + taskHours).toFixed(1)),
                };
              }
              return s;
            });

            return { timerLogs: updatedLogs, subjects: updatedSubjects };
          } else {
            // Uncompleting a task
            if (logIdx >= 0) {
              const current = updatedLogs[logIdx];
              const breakdown = { ...(current.subjectBreakdown || {}) };
              let curSubj = 0;

              Object.keys(breakdown).forEach((k) => {
                if (k.toLowerCase() === subjName.toLowerCase()) {
                  curSubj += Number(breakdown[k]) || 0;
                  delete breakdown[k];
                }
              });

              const newHours = Math.max(0, Number(((current.hours || 0) - taskHours).toFixed(2)));
              const newSubjHours = Math.max(0, Number((curSubj - taskHours).toFixed(2)));
              const newTasksCompleted = Math.max(0, (current.tasksCompleted || 1) - 1);

              if (newSubjHours > 0) {
                breakdown[subjName] = newSubjHours;
              }

              updatedLogs[logIdx] = {
                ...current,
                hours: newHours,
                tasksCompleted: newTasksCompleted,
                subjectBreakdown: breakdown,
              };
            }

            const updatedSubjects = state.subjects.map((s) => {
              if (s.name.toLowerCase() === subjName.toLowerCase() || s.id === task.subjectId) {
                return {
                  ...s,
                  completedHoursThisWeek: Math.max(0, Number(((s.completedHoursThisWeek || 0) - taskHours).toFixed(1))),
                };
              }
              return s;
            });

            return { timerLogs: updatedLogs, subjects: updatedSubjects };
          }
        });
      },

      // Backup & Restore
      exportDataJSON: () => {
        const state = get();
        const exportObj = {
          version: 'build-lhs-v1',
          exportedAt: new Date().toISOString(),
          tasks: state.tasks,
          subjects: state.subjects,
          goals: state.goals,
          routines: state.routines,
          timerLogs: state.timerLogs,
          yearlyPlan: state.yearlyPlan,
        };
        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `build-lhs-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },

      importDataJSON: (jsonString) => {
        try {
          const parsed = JSON.parse(jsonString);
          if (!parsed.tasks || !parsed.subjects) {
            throw new Error('Invalid backup file format');
          }
          set({
            tasks: parsed.tasks || [],
            subjects: parsed.subjects || [],
            goals: parsed.goals || [],
            routines: parsed.routines || [],
            timerLogs: parsed.timerLogs || [],
            yearlyPlan: parsed.yearlyPlan || INITIAL_MONTHS_PLAN,
          });
          return { success: true };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      // Daily visit tracking: increments streak every day user visits the website
      recordDailyVisit: () => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        set((state) => {
          const logIdx = state.timerLogs.findIndex((l) => l.date === todayStr);
          if (logIdx >= 0) {
            if (state.timerLogs[logIdx].visited) return state;
            const updatedLogs = [...state.timerLogs];
            updatedLogs[logIdx] = { ...updatedLogs[logIdx], visited: true };
            return { timerLogs: updatedLogs };
          } else {
            return {
              timerLogs: [
                ...state.timerLogs,
                {
                  date: todayStr,
                  hours: 0,
                  tasksCompleted: 0,
                  visited: true,
                  subjectBreakdown: {},
                },
              ],
            };
          }
        });
      },

      resetAllData: () => {
        set({
          tasks: INITIAL_TASKS,
          subjects: INITIAL_SUBJECTS,
          goals: [],
          routines: INITIAL_ROUTINES,
          timerLogs: INITIAL_TIMER_LOGS,
          yearlyPlan: INITIAL_MONTHS_PLAN,
        });
      },
    }),
    {
      name: 'build-lhs-v1',
      version: 2,
      migrate: (persistedState) => {
        return sanitizeStoreState(persistedState);
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          const sanitized = sanitizeStoreState(state);
          useTaskStore.setState(sanitized);
          if (typeof state.recordDailyVisit === 'function') {
            state.recordDailyVisit();
          }
        }
      },
    }
  )
);

// Trigger daily visit tracking immediately on load
try {
  if (typeof useTaskStore.getState === 'function') {
    useTaskStore.getState().recordDailyVisit();
  }
} catch {
  // ignore
}

