import { Task } from '../types/task';

export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysISO(baseISO: string, days: number): string {
  const [y, m, d] = baseISO.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return formatDateISO(dt);
}

export function formatHeaderDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function formatShortDate(isoDate: string, todayISO: string): string {
  if (isoDate === todayISO) return 'Today';
  if (isoDate === addDaysISO(todayISO, 1)) return 'Tomorrow';
  if (isoDate === addDaysISO(todayISO, -1)) return 'Yesterday';
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTimeDisplay(time24?: string): string | null {
  if (!time24) return null;
  const [hStr, mStr] = time24.split(':');
  const h = Number(hStr);
  if (Number.isNaN(h)) return null;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${suffix}`;
}

export function getWeekDays(todayISO: string, count = 7): Array<{
  iso: string;
  weekdayShort: string;
  dayNumber: string;
  isToday: boolean;
}> {
  return Array.from({ length: count }, (_, idx) => {
    const iso = addDaysISO(todayISO, idx);
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return {
      iso,
      weekdayShort: dt.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: String(d),
      isToday: idx === 0,
    };
  });
}

export function createSeedTasks(todayISO: string): Task[] {
  const tomorrowISO = addDaysISO(todayISO, 1);
  const dayAfterISO = addDaysISO(todayISO, 2);

  return [
    {
      id: 'test-task-1',
      title: 'Verify Supabase Connection & Real-Time Sync',
      notes:
        'Test that tasks load directly from your live Supabase database and sync automatically across open browser tabs.',
      completed: false,
      date: todayISO,
      time: '09:00',
      timeBlock: 'Morning',
      category: 'Deep Work',
      durationMinutes: 25,
      priority: 'Important',
      subtasks: [
        { id: 'st-1', title: 'Verify .env URL and Anon key credentials', completed: true },
        { id: 'st-2', title: 'Verify table schema exists in Supabase SQL editor', completed: true },
        { id: 'st-3', title: 'Open a second browser tab to verify real-time syncing', completed: false },
      ],
      createdAt: todayISO,
    },
    {
      id: 'test-task-2',
      title: 'Test Create Task (Inline & Modal Sheet)',
      notes:
        'Test inserting a new task using the inline quick-add bar above or by clicking the floating (+) button in the bottom right.',
      completed: false,
      date: todayISO,
      time: '11:00',
      timeBlock: 'Morning',
      category: 'Studio',
      durationMinutes: 15,
      priority: 'Calm',
      subtasks: [
        { id: 'st-4', title: 'Add a quick inline task for today', completed: false },
        { id: 'st-5', title: 'Create a task with custom time and area from modal', completed: false },
      ],
      createdAt: todayISO,
    },
    {
      id: 'test-task-3',
      title: 'Test Update & Detail Inspector',
      notes:
        'Click on this card to open the right-side inspector. Edit the title, notes, or toggle sub-steps to verify the UPDATE query in Supabase.',
      completed: false,
      date: todayISO,
      time: '14:00',
      timeBlock: 'Afternoon',
      category: 'Personal',
      durationMinutes: 45,
      priority: 'Important',
      subtasks: [
        { id: 'st-6', title: 'Open the inspector panel on the right', completed: true },
        { id: 'st-7', title: 'Edit notes or change the priority', completed: false },
        { id: 'st-8', title: 'Add a new sub-step item', completed: false },
      ],
      createdAt: todayISO,
    },
    {
      id: 'test-task-4',
      title: 'Test Focus Timer Session',
      notes:
        'Click the Focus button on this task to launch the single-task Pomodoro timer and record focused minutes.',
      completed: false,
      date: todayISO,
      time: '17:00',
      timeBlock: 'Afternoon',
      category: 'Mindfulness',
      durationMinutes: 25,
      priority: 'Calm',
      subtasks: [],
      createdAt: todayISO,
    },
    {
      id: 'test-task-5',
      title: 'Test Reschedule & Upcoming Tab',
      notes:
        'Scheduled for tomorrow. Switch to the "Upcoming" screen in the top nav to test date horizons and calendar navigation.',
      completed: false,
      date: tomorrowISO,
      time: '10:30',
      timeBlock: 'Morning',
      category: 'Errands',
      durationMinutes: 15,
      priority: 'Calm',
      subtasks: [
        { id: 'st-9', title: 'Navigate to the Upcoming screen', completed: false },
        { id: 'st-10', title: 'Reschedule a task to a different day', completed: false },
      ],
      createdAt: todayISO,
    },
    {
      id: 'test-task-6',
      title: 'Test Completed Archive & Delete',
      notes:
        'This task is completed. Check the "Completed" screen in the navigation to verify archived tasks, restore operations, and deletion.',
      completed: true,
      completedAt: new Date().toISOString(),
      date: todayISO,
      timeBlock: 'Morning',
      category: 'Personal',
      durationMinutes: 15,
      priority: 'Calm',
      subtasks: [
        { id: 'st-11', title: 'Initial database configuration', completed: true },
      ],
      createdAt: todayISO,
    },
  ];
}
