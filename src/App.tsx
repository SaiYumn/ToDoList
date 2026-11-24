import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Moon,
  Play,
  Plus,
  Search,
  Sun,
  X,
} from 'lucide-react';
import {
  AppScreen,
  CATEGORIES,
  TIME_BLOCKS,
  Task,
  TaskCategory,
  TaskPriority,
  TaskTimeBlock,
} from './types/task';
import {
  addDaysISO,
  createSeedTasks,
  formatDateISO,
  formatHeaderDate,
  formatTimeDisplay,
} from './data/seedTasks';
import { TaskCard } from './components/TaskCard';
import { InlineQuickAdd } from './components/InlineQuickAdd';
import { TaskDetailPanel } from './components/TaskDetailPanel';
import { QuickAddSheet } from './components/QuickAddSheet';
import { UpcomingScreen } from './components/UpcomingScreen';
import { FocusScreen } from './components/FocusScreen';
import { ArchiveScreen } from './components/ArchiveScreen';

const STORAGE_KEY_TASKS = 'kanso_tasks_v1';
const STORAGE_KEY_THEME = 'kanso_theme_v1';
const STORAGE_KEY_FOCUS_MINUTES = 'kanso_focus_minutes_v1';

type CategoryFilter = 'All' | TaskCategory;

export default function App() {
  const todayISO = useMemo(() => formatDateISO(new Date()), []);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore storage access errors
    }
    return 'light';
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TASKS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return createSeedTasks(formatDateISO(new Date()));
  });

  const [totalFocusedMinutes, setTotalFocusedMinutes] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FOCUS_MINUTES);
      const parsed = Number(raw);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : 50;
    } catch {
      return 50;
    }
  });

  const [activeScreen, setActiveScreen] = useState<AppScreen>('today');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompletedToday, setShowCompletedToday] = useState(true);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const [undoToast, setUndoToast] = useState<{
    message: string;
    previousTasks: Task[];
  } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const undoTimerRef = useRef<number | null>(null);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Persist tasks
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  // Persist focus minutes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FOCUS_MINUTES, String(totalFocusedMinutes));
    } catch {
      // ignore
    }
  }, [totalFocusedMinutes]);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (e.key === 'Escape') {
        if (quickAddOpen) {
          setQuickAddOpen(false);
          return;
        }
        if (selectedTaskId) {
          setSelectedTaskId(null);
          return;
        }
        if (searchOpen) {
          setSearchOpen(false);
          setSearchQuery('');
        }
        return;
      }

      if (isTyping) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setQuickAddOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 40);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [quickAddOpen, selectedTaskId, searchOpen]);

  const showUndo = useCallback((message: string, previousTasks: Task[]) => {
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current);
    }
    setUndoToast({ message, previousTasks });
    undoTimerRef.current = window.setTimeout(() => {
      setUndoToast(null);
    }, 4500);
  }, []);

  const handleUndo = () => {
    if (!undoToast) return;
    setTasks(undoToast.previousTasks);
    setUndoToast(null);
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current);
    }
  };

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  const activeFocusTask = useMemo(
    () => tasks.find((t) => t.id === focusTaskId) || null,
    [tasks, focusTaskId]
  );

  const handleToggleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  }, []);

  const handleUpdateTask = useCallback((updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  const handleDeleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const target = prev.find((t) => t.id === id);
        if (target) {
          showUndo(`Deleted "${target.title}"`, prev);
        }
        return prev.filter((t) => t.id !== id);
      });
      if (selectedTaskId === id) {
        setSelectedTaskId(null);
      }
      if (focusTaskId === id) {
        setFocusTaskId(null);
      }
    },
    [selectedTaskId, focusTaskId, showUndo]
  );

  const handleQuickReschedule = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const target = prev.find((t) => t.id === id);
        if (!target) return prev;
        const nextDate =
          target.date === todayISO
            ? addDaysISO(todayISO, 1)
            : addDaysISO(target.date, 1);
        showUndo(`Moved "${target.title}" to next day`, prev);
        return prev.map((t) => (t.id === id ? { ...t, date: nextDate } : t));
      });
    },
    [todayISO, showUndo]
  );

  const handleAddInlineTask = useCallback(
    (payload: {
      title: string;
      date: string;
      category: TaskCategory;
      timeBlock: TaskTimeBlock;
      durationMinutes: number;
    }) => {
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: payload.title,
        notes: '',
        completed: false,
        date: payload.date,
        timeBlock: payload.timeBlock,
        category: payload.category,
        durationMinutes: payload.durationMinutes,
        priority: 'Calm',
        subtasks: [],
        createdAt: todayISO,
      };
      setTasks((prev) => [newTask, ...prev]);
    },
    [todayISO]
  );

  const handleCreateFromSheet = useCallback(
    (payload: {
      title: string;
      notes: string;
      date: string;
      time?: string;
      timeBlock: TaskTimeBlock;
      category: TaskCategory;
      durationMinutes: number;
      priority: TaskPriority;
    }) => {
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: payload.title,
        notes: payload.notes,
        completed: false,
        date: payload.date,
        time: payload.time,
        timeBlock: payload.timeBlock,
        category: payload.category,
        durationMinutes: payload.durationMinutes,
        priority: payload.priority,
        subtasks: [],
        createdAt: todayISO,
      };
      setTasks((prev) => [newTask, ...prev]);
      if (payload.date > todayISO && activeScreen === 'today') {
        setActiveScreen('upcoming');
      }
    },
    [todayISO, activeScreen]
  );

  const handleStartFocus = useCallback((task: Task) => {
    setFocusTaskId(task.id);
    setActiveScreen('focus');
    setSelectedTaskId(null);
  }, []);

  const handleClearAllCompleted = useCallback(() => {
    setTasks((prev) => {
      showUndo('Cleared completed log', prev);
      return prev.filter((t) => !t.completed);
    });
  }, [showUndo]);

  // Today's filtered tasks
  const todayTasksAll = useMemo(
    () => tasks.filter((t) => t.date <= todayISO && (!t.completed || t.date === todayISO)),
    [tasks, todayISO]
  );

  const filteredTodayTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return todayTasksAll.filter((t) => {
      if (categoryFilter !== 'All' && t.category !== categoryFilter) {
        return false;
      }
      if (query) {
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchNotes = t.notes.toLowerCase().includes(query);
        const matchCategory = t.category.toLowerCase().includes(query);
        return matchTitle || matchNotes || matchCategory;
      }
      return true;
    });
  }, [todayTasksAll, categoryFilter, searchQuery]);

  const activeTodayTasks = useMemo(
    () => filteredTodayTasks.filter((t) => !t.completed),
    [filteredTodayTasks]
  );

  const completedTodayTasks = useMemo(
    () => filteredTodayTasks.filter((t) => t.completed),
    [filteredTodayTasks]
  );

  const groupedActiveToday = useMemo(() => {
    const groups: Record<TaskTimeBlock, Task[]> = {
      Morning: [],
      Afternoon: [],
      Evening: [],
      Unscheduled: [],
    };
    for (const task of activeTodayTasks) {
      groups[task.timeBlock].push(task);
    }
    for (const block of TIME_BLOCKS) {
      groups[block].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
    }
    return groups;
  }, [activeTodayTasks]);

  const todayStats = useMemo(() => {
    const total = todayTasksAll.length;
    const completed = todayTasksAll.filter((t) => t.completed).length;
    const remainingMinutes = todayTasksAll
      .filter((t) => !t.completed)
      .reduce((acc, t) => acc + t.durationMinutes, 0);
    const nextUp =
      todayTasksAll
        .filter((t) => !t.completed)
        .sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority === 'Important' ? -1 : 1;
          }
          return (a.time || '99:99').localeCompare(b.time || '99:99');
        })[0] || null;

    return { total, completed, remainingMinutes, nextUp };
  }, [todayTasksAll]);

  const completionRatio =
    todayStats.total > 0 ? todayStats.completed / todayStats.total : 0;

  return (
    <div className="min-h-screen bg-[#F3F5F0] dark:bg-[#121815] text-[#19211C] dark:text-[#E6EBE7] transition-colors">
      {/* Top Bar Contract: Single crisp header, no sidebar/bottom chrome */}
      <header className="sticky top-0 z-30 bg-[#F3F5F0]/90 dark:bg-[#121815]/90 backdrop-blur-md border-b border-[#E1E6DF] dark:border-[#27342F]">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 h-[60px] flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand Title */}
          <button
            type="button"
            onClick={() => {
              setActiveScreen('today');
              setSelectedTaskId(null);
            }}
            className="text-[18px] font-semibold tracking-[-0.02em] text-[#19211C] dark:text-[#E6EBE7] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6F54] rounded-md"
          >
            Kanso
          </button>

          {/* Zone 2: Desktop Navigation Links */}
          <nav
            aria-label="Primary views"
            className="hidden md:flex items-center gap-6"
          >
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'focus', label: 'Focus' },
                { id: 'archive', label: 'Completed' },
              ] as Array<{ id: AppScreen; label: string }>
            ).map((item) => {
              const active = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveScreen(item.id)}
                  className={`relative py-1.5 text-[14px] font-medium whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'text-[#19211C] dark:text-[#E6EBE7]'
                      : 'text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full bg-[#1F6F54] dark:bg-[#4FB58C]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Utilities + Primary Action */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSearchOpen((prev) => !prev);
                if (!searchOpen) {
                  setActiveScreen('today');
                  setTimeout(() => searchInputRef.current?.focus(), 40);
                } else {
                  setSearchQuery('');
                }
              }}
              aria-label="Search tasks"
              aria-expanded={searchOpen}
              className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-[10px] transition-colors ${
                searchOpen
                  ? 'bg-[#FFFFFF] dark:bg-[#1B2420] text-[#1F6F54] dark:text-[#4FB58C] border border-[#E1E6DF] dark:border-[#27342F]'
                  : 'text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]'
              }`}
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-[10px] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7] transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-[18px] h-[18px]" />
              ) : (
                <Sun className="w-[18px] h-[18px]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setQuickAddOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 ml-1 rounded-[10px] bg-[#1F6F54] hover:bg-[#175440] dark:bg-[#4FB58C] dark:hover:bg-[#62C39C] text-white dark:text-[#121815] text-[13.5px] font-medium whitespace-nowrap shrink-0 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="max-w-5xl mx-auto px-5 lg:px-8 pt-5 pb-28 lg:pb-14">
        {/* Mobile Screen Switcher (Clean horizontal segmented control; zero bottom chrome) */}
        <div className="md:hidden mb-5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'focus', label: 'Focus' },
                { id: 'archive', label: 'Completed' },
              ] as Array<{ id: AppScreen; label: string }>
            ).map((item) => {
              const active = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveScreen(item.id)}
                  className={`h-[34px] px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap shrink-0 transition-all ${
                    active
                      ? 'kanso-chip-active'
                      : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Two-Column Desktop Split / Single-Column Mobile Stack */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-7">
          {/* Primary Column */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Contextual Screen Heading */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-[26px] leading-[34px] font-semibold tracking-[-0.015em] text-[#19211C] dark:text-[#E6EBE7]">
                  {activeScreen === 'today' && 'Today'}
                  {activeScreen === 'upcoming' && 'Upcoming'}
                  {activeScreen === 'focus' && 'Focus'}
                  {activeScreen === 'archive' && 'Completed'}
                </h1>
                <p className="mt-0.5 text-[13.5px] text-[#65776C] dark:text-[#7E9689] tabular-nums">
                  {activeScreen === 'today' &&
                    `${formatHeaderDate(todayISO)} · ${todayStats.completed} of ${todayStats.total} done`}
                  {activeScreen === 'upcoming' &&
                    'Seven-day horizon and scheduled blocks'}
                  {activeScreen === 'focus' &&
                    'Single-task cadence without distraction'}
                  {activeScreen === 'archive' &&
                    'Quiet archive of completed intentions'}
                </p>
              </div>
            </div>

            {/* Expandable Search Input */}
            {searchOpen && (
              <div className="kanso-input flex items-center gap-2 px-3.5 py-2">
                <Search className="w-4 h-4 text-[#65776C] dark:text-[#7E9689] shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter tasks by title, note, or area..."
                  aria-label="Filter tasks"
                  className="flex-1 min-w-0 bg-transparent text-[14.5px] text-[#19211C] dark:text-[#E6EBE7] placeholder:text-[#65776C] dark:placeholder:text-[#7E9689] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* SCREEN 1: TODAY AGENDA */}
            {activeScreen === 'today' && (
              <div className="space-y-5">
                {/* Filter & Category Chips */}
                <div
                  className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5"
                  role="group"
                  aria-label="Filter by area"
                >
                  {(['All', ...CATEGORIES] as CategoryFilter[]).map((cat) => {
                    const isActive = categoryFilter === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={`h-[34px] px-[14px] rounded-full text-[13px] font-medium whitespace-nowrap shrink-0 transition-all ${
                          isActive
                            ? 'kanso-chip-active'
                            : 'bg-transparent border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Inline Quick Add */}
                <InlineQuickAdd
                  defaultDate={todayISO}
                  onAdd={handleAddInlineTask}
                />

                {/* Active Tasks Grouped by Time Block */}
                {activeTodayTasks.length === 0 ? (
                  <div className="kanso-card px-5 py-9 text-center">
                    <p className="text-[15.5px] font-medium text-[#19211C] dark:text-[#E6EBE7]">
                      {searchQuery || categoryFilter !== 'All'
                        ? 'No matching tasks'
                        : 'Your agenda is clear'}
                    </p>
                    <p className="mt-1 text-[13.5px] text-[#65776C] dark:text-[#7E9689]">
                      {searchQuery || categoryFilter !== 'All'
                        ? 'Try clearing your filter or search query.'
                        : 'Everything scheduled for today is complete. Enjoy the quiet space.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {TIME_BLOCKS.map((block) => {
                      const items = groupedActiveToday[block];
                      if (items.length === 0) return null;
                      return (
                        <section key={block} className="space-y-2.5">
                          <div className="flex items-center justify-between px-0.5">
                            <h2 className="text-[13px] font-medium text-[#65776C] dark:text-[#7E9689]">
                              {block}
                            </h2>
                            <span className="text-[12px] text-[#65776C] dark:text-[#7E9689] tabular-nums">
                              {items.length}
                            </span>
                          </div>
                          <div className="space-y-2.5">
                            {items.map((task) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                todayISO={todayISO}
                                showDate={task.date < todayISO}
                                isSelected={selectedTaskId === task.id}
                                onToggleComplete={handleToggleComplete}
                                onSelect={(t) => setSelectedTaskId(t.id)}
                                onStartFocus={handleStartFocus}
                                onQuickReschedule={handleQuickReschedule}
                                onDelete={handleDeleteTask}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                )}

                {/* Collapsible Completed Today Section */}
                {completedTodayTasks.length > 0 && (
                  <section className="pt-2 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setShowCompletedToday((prev) => !prev)}
                      className="flex items-center gap-1.5 text-[13px] font-medium text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7] transition-colors py-1"
                    >
                      {showCompletedToday ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <span>Completed</span>
                      <span className="tabular-nums opacity-80">
                        · {completedTodayTasks.length}
                      </span>
                    </button>

                    {showCompletedToday && (
                      <div className="space-y-2.5">
                        {completedTodayTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            todayISO={todayISO}
                            isSelected={selectedTaskId === task.id}
                            onToggleComplete={handleToggleComplete}
                            onSelect={(t) => setSelectedTaskId(t.id)}
                            onStartFocus={handleStartFocus}
                            onQuickReschedule={handleQuickReschedule}
                            onDelete={handleDeleteTask}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </div>
            )}

            {/* SCREEN 2: UPCOMING */}
            {activeScreen === 'upcoming' && (
              <UpcomingScreen
                tasks={tasks}
                todayISO={todayISO}
                selectedTaskId={selectedTaskId}
                onToggleComplete={handleToggleComplete}
                onSelectTask={(t) => setSelectedTaskId(t.id)}
                onStartFocus={handleStartFocus}
                onQuickReschedule={handleQuickReschedule}
                onDeleteTask={handleDeleteTask}
                onAddInlineTask={handleAddInlineTask}
              />
            )}

            {/* SCREEN 3: FOCUS TIMER */}
            {activeScreen === 'focus' && (
              <FocusScreen
                tasks={tasks}
                activeTask={activeFocusTask}
                onSelectFocusTask={(t) => setFocusTaskId(t ? t.id : null)}
                onCompleteTask={handleToggleComplete}
                onRecordFocusMinutes={(mins) =>
                  setTotalFocusedMinutes((prev) => prev + mins)
                }
              />
            )}

            {/* SCREEN 4: ARCHIVE / COMPLETED LOG */}
            {activeScreen === 'archive' && (
              <ArchiveScreen
                tasks={tasks}
                todayISO={todayISO}
                totalFocusedMinutes={totalFocusedMinutes}
                onRestoreTask={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
                onClearAllCompleted={handleClearAllCompleted}
              />
            )}
          </div>

          {/* Desktop Right Inspector / Daily Rhythm Column */}
          <aside className="hidden lg:block w-[350px] shrink-0 sticky top-[84px]">
            {selectedTask ? (
              <TaskDetailPanel
                task={selectedTask}
                todayISO={todayISO}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
                onStartFocus={handleStartFocus}
                onClose={() => setSelectedTaskId(null)}
                variant="inspector"
              />
            ) : (
              <div className="space-y-4">
                {/* Daily Rhythm Summary Card */}
                <div className="kanso-card p-5 space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[12px] font-medium text-[#65776C] dark:text-[#7E9689]">
                        Daily Rhythm
                      </p>
                      <p className="mt-1 text-[22px] font-semibold tabular-nums text-[#19211C] dark:text-[#E6EBE7]">
                        {todayStats.completed} / {todayStats.total}
                        <span className="ml-1.5 text-[13.5px] font-normal text-[#65776C] dark:text-[#7E9689]">
                          tasks
                        </span>
                      </p>
                    </div>

                    {/* Minimal Progress Ring */}
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 48 48"
                      className="-rotate-90 shrink-0"
                      aria-hidden="true"
                    >
                      <circle
                        cx="24"
                        cy="24"
                        r="19"
                        fill="none"
                        className="stroke-[#E1E6DF] dark:stroke-[#27342F]"
                        strokeWidth="3.5"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="19"
                        fill="none"
                        className="stroke-[#1F6F54] dark:stroke-[#4FB58C] transition-[stroke-dashoffset] duration-300 ease-out"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 19}
                        strokeDashoffset={2 * Math.PI * 19 * (1 - completionRatio)}
                      />
                    </svg>
                  </div>

                  <div className="pt-4 border-t border-[#E1E6DF] dark:border-[#27342F] flex items-center justify-between text-[13px]">
                    <span className="text-[#65776C] dark:text-[#7E9689]">
                      Estimated remaining
                    </span>
                    <span className="font-medium tabular-nums text-[#19211C] dark:text-[#E6EBE7]">
                      {todayStats.remainingMinutes} min
                    </span>
                  </div>

                  {todayStats.nextUp && (
                    <div className="pt-4 border-t border-[#E1E6DF] dark:border-[#27342F] space-y-3">
                      <p className="text-[12px] font-medium text-[#65776C] dark:text-[#7E9689]">
                        Suggested Next
                      </p>
                      <div
                        onClick={() => setSelectedTaskId(todayStats.nextUp!.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedTaskId(todayStats.nextUp!.id);
                          }
                        }}
                        className="p-3 rounded-[10px] bg-[#F8FAF5] dark:bg-[#161E1A] border border-[#E1E6DF] dark:border-[#27342F] cursor-pointer hover:border-[#1F6F54] dark:hover:border-[#4FB58C] transition-colors"
                      >
                        <p className="text-[14px] font-medium text-[#19211C] dark:text-[#E6EBE7] leading-[20px]">
                          {todayStats.nextUp.title}
                        </p>
                        <p className="mt-1 text-[12px] text-[#65776C] dark:text-[#7E9689] tabular-nums">
                          {formatTimeDisplay(todayStats.nextUp.time) ||
                            todayStats.nextUp.timeBlock}{' '}
                          · {todayStats.nextUp.category} ·{' '}
                          {todayStats.nextUp.durationMinutes}m
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStartFocus(todayStats.nextUp!)}
                        className="w-full h-10 rounded-[10px] bg-[#1F6F54] hover:bg-[#175440] dark:bg-[#4FB58C] dark:hover:bg-[#62C39C] text-white dark:text-[#121815] text-[13.5px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Begin Focus Session
                      </button>
                    </div>
                  )}
                </div>

                {/* Quiet Tip Card */}
                <div className="px-4 py-3.5 rounded-[12px] border border-[#E1E6DF] dark:border-[#27342F] text-[12.5px] leading-[19px] text-[#65776C] dark:text-[#7E9689]">
                  Select any task card to edit notes, break it into smaller steps, or adjust its schedule. Press{' '}
                  <kbd className="font-mono-tabular px-1.5 py-0.5 rounded bg-[#FFFFFF] dark:bg-[#1B2420] border border-[#E1E6DF] dark:border-[#27342F] text-[11px] text-[#19211C] dark:text-[#E6EBE7]">
                    N
                  </kbd>{' '}
                  for quick capture.
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Mobile / Tablet Task Detail Bottom Sheet */}
      {selectedTask && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/35 dark:bg-black/60 backdrop-blur-[2px] p-0 sm:p-4"
          onClick={() => setSelectedTaskId(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Edit task"
        >
          <div
            className="w-full sm:max-w-[480px]"
            onClick={(e) => e.stopPropagation()}
          >
            <TaskDetailPanel
              task={selectedTask}
              todayISO={todayISO}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              onStartFocus={handleStartFocus}
              onClose={() => setSelectedTaskId(null)}
              variant="sheet"
            />
          </div>
        </div>
      )}

      {/* Floating Thumb-Zone Quick-Add Button (52x52px circular trigger per spec) */}
      {activeScreen !== 'focus' && (
        <button
          type="button"
          onClick={() => setQuickAddOpen(true)}
          aria-label="New task"
          className="fixed bottom-6 right-5 sm:right-8 z-40 w-[52px] h-[52px] rounded-full bg-[#1F6F54] hover:bg-[#175440] active:scale-95 dark:bg-[#4FB58C] dark:hover:bg-[#62C39C] text-white dark:text-[#121815] flex items-center justify-center shadow-[0_8px_24px_rgba(25,33,28,0.16)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1F6F54]"
        >
          <Plus className="w-6 h-6 stroke-[2.2]" />
        </button>
      )}

      {/* Quick Add Sheet Modal */}
      <QuickAddSheet
        isOpen={quickAddOpen}
        todayISO={todayISO}
        onClose={() => setQuickAddOpen(false)}
        onCreate={handleCreateFromSheet}
      />

      {/* Subtle Undo Bar */}
      {undoToast && (
        <div className="fixed bottom-6 left-5 z-40 kanso-elevated px-4 py-2.5 flex items-center gap-3 max-w-[calc(100vw-96px)]">
          <span className="text-[13px] text-[#19211C] dark:text-[#E6EBE7] truncate">
            {undoToast.message}
          </span>
          <button
            type="button"
            onClick={handleUndo}
            className="text-[13px] font-semibold text-[#1F6F54] dark:text-[#4FB58C] hover:underline whitespace-nowrap shrink-0"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
