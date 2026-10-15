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
      searchQuery: '',
      filterSubject: 'all',
      filterPriority: 'all',
      filterStatus: 'all',
      sortBy: 'time', // 'time' | 'priority' | 'title' | 'duration'

      // Actions for filters
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterSubject: (subject) => set({ filterSubject: subject }),
      setFilterPriority: (priority) => set({ filterPriority: priority }),
      setFilterStatus: (status) => set({ filterStatus: status }),
      setSortBy: (sortBy) => set({ sortBy }),

      // Task actions
      addTask: (newTask) => {
        const id = `task-${Date.now()}`;
        const task = {
          id,
          title: newTask.title || 'Untitled Study Task',
          description: newTask.description || '',
          subjectId: newTask.subjectId || 'subj-math',
          subject: newTask.subject || 'Mathematics',
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
        }));
        return task;
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
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

        // If completed, record study log if not already counted today
        if (nextStatus === 'Done') {
          get().recordTaskCompletion(task);
        }
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
        const id = `subj-${Date.now()}`;
        const subject = {
          id,
          name: newSubject.name,
          code: newSubject.code || newSubject.name.substring(0, 4).toUpperCase(),
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
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
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
          subject: newBlock.subject || 'Mathematics',
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
            const subjectObj = get().subjects.find((s) => s.name === block.subject) || get().subjects[0];
            return {
              id: `task-routine-${Date.now()}-${idx}`,
              title: block.title,
              description: `Generated from template "${routine.name}"`,
              subjectId: subjectObj ? subjectObj.id : 'subj-math',
              subject: block.subject || 'Mathematics',
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

      // Log study session from Pomodoro or manual entry
      logStudySession: ({ subjectName, durationMinutes, taskId }) => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const hoursToAdd = Number((durationMinutes / 60).toFixed(2));

        set((state) => {
          const existingLogIndex = state.timerLogs.findIndex((log) => log.date === todayStr);
          let updatedLogs = [...state.timerLogs];

          if (existingLogIndex >= 0) {
            const current = updatedLogs[existingLogIndex];
            const currentSubjHours = (current.subjectBreakdown && current.subjectBreakdown[subjectName]) || 0;
            updatedLogs[existingLogIndex] = {
              ...current,
              hours: Number((current.hours + hoursToAdd).toFixed(2)),
              subjectBreakdown: {
                ...(current.subjectBreakdown || {}),
                [subjectName]: Number((currentSubjHours + hoursToAdd).toFixed(2)),
              },
            };
          } else {
            updatedLogs.push({
              date: todayStr,
              hours: hoursToAdd,
              tasksCompleted: 0,
              subjectBreakdown: {
                [subjectName]: hoursToAdd,
              },
            });
          }

          // Also update subject completed hours
          const updatedSubjects = state.subjects.map((s) => {
            if (s.name === subjectName) {
              return {
                ...s,
                completedHoursThisWeek: Number((s.completedHoursThisWeek + hoursToAdd).toFixed(1)),
              };
            }
            return s;
          });

          return {
            timerLogs: updatedLogs,
            subjects: updatedSubjects,
          };
        });
      },

      recordTaskCompletion: (task) => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        set((state) => {
          const logIdx = state.timerLogs.findIndex((l) => l.date === todayStr);
          let updatedLogs = [...state.timerLogs];
          if (logIdx >= 0) {
            updatedLogs[logIdx] = {
              ...updatedLogs[logIdx],
              tasksCompleted: (updatedLogs[logIdx].tasksCompleted || 0) + 1,
            };
          } else {
            updatedLogs.push({
              date: todayStr,
              hours: Number((task.duration / 60).toFixed(1)),
              tasksCompleted: 1,
              subjectBreakdown: {
                [task.subject]: Number((task.duration / 60).toFixed(1)),
              },
            });
          }
          return { timerLogs: updatedLogs };
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

      resetAllData: () => {
        set({
          tasks: INITIAL_TASKS,
          subjects: INITIAL_SUBJECTS,
          goals: INITIAL_GOALS,
          routines: INITIAL_ROUTINES,
          timerLogs: INITIAL_TIMER_LOGS,
          yearlyPlan: INITIAL_MONTHS_PLAN,
        });
      },
    }),
    {
      name: 'build-lhs-v1',
      version: 1,
    }
  )
);
