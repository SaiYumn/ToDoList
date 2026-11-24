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
  const yesterdayISO = addDaysISO(todayISO, -1);
  const tomorrowISO = addDaysISO(todayISO, 1);
  const dayAfterISO = addDaysISO(todayISO, 2);
  const threeDaysISO = addDaysISO(todayISO, 3);

  return [
    {
      id: 'task-1',
      title: 'Review spatial layout specifications',
      notes:
        'Verify 44px touch ergonomics and light/dark hairline border contrast across card components before afternoon sign-off.',
      completed: true,
      completedAt: new Date().toISOString(),
      date: todayISO,
      time: '08:30',
      timeBlock: 'Morning',
      category: 'Deep Work',
      durationMinutes: 45,
      priority: 'Important',
      subtasks: [
        { id: 'st-1', title: 'Audit light canvas contrast ratios', completed: true },
        { id: 'st-2', title: 'Check mobile viewport spacing at 375px', completed: true },
      ],
      createdAt: yesterdayISO,
    },
    {
      id: 'task-2',
      title: 'Draft quiet-hours team communication memo',
      notes:
        'Outline async focus blocks between 9:00 AM and 12:00 PM so studio contributors have uninterrupted deep work windows.',
      completed: false,
      date: todayISO,
      time: '10:00',
      timeBlock: 'Morning',
      category: 'Studio',
      durationMinutes: 25,
      priority: 'Important',
      subtasks: [
        { id: 'st-3', title: 'Summarize core focus window hours', completed: true },
        { id: 'st-4', title: 'Add escalation channel guidelines', completed: false },
        { id: 'st-5', title: 'Share draft with Kenji for review', completed: false },
      ],
      createdAt: yesterdayISO,
    },
    {
      id: 'task-3',
      title: 'Water indoor ficus and mist fern leaves',
      notes: 'Check topsoil moisture first; rotate ceramic pot a quarter turn toward morning window light.',
      completed: false,
      date: todayISO,
      time: '11:30',
      timeBlock: 'Morning',
      category: 'Mindfulness',
      durationMinutes: 15,
      priority: 'Calm',
      subtasks: [],
      createdAt: yesterdayISO,
    },
    {
      id: 'task-4',
      title: 'Synthesize user interview field notes',
      notes: 'Group recurring friction points around task rescheduling and categorize quick-add gestures.',
      completed: false,
      date: todayISO,
      time: '14:00',
      timeBlock: 'Afternoon',
      category: 'Deep Work',
      durationMinutes: 60,
      priority: 'Important',
      subtasks: [
        { id: 'st-6', title: 'Tag recordings from sessions 4–6', completed: false },
        { id: 'st-7', title: 'Extract three actionable insights', completed: false },
      ],
      createdAt: yesterdayISO,
    },
    {
      id: 'task-5',
      title: 'Pick up ceramic pour-over filters and matcha',
      notes: 'Stop by Kyoto Roasters on the way back from the post office.',
      completed: false,
      date: todayISO,
      time: '17:15',
      timeBlock: 'Afternoon',
      category: 'Errands',
      durationMinutes: 25,
      priority: 'Calm',
      subtasks: [],
      createdAt: yesterdayISO,
    },
    {
      id: 'task-6',
      title: 'Evening 20-minute walk without phone',
      notes: 'Leave devices on the entryway tray. Notice the evening air and wind down before dinner.',
      completed: false,
      date: todayISO,
      time: '19:00',
      timeBlock: 'Evening',
      category: 'Mindfulness',
      durationMinutes: 25,
      priority: 'Calm',
      subtasks: [],
      createdAt: yesterdayISO,
    },
    {
      id: 'task-7',
      title: 'Clear desk surface and sharpen pencils',
      notes: '',
      completed: true,
      completedAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
      date: todayISO,
      timeBlock: 'Morning',
      category: 'Personal',
      durationMinutes: 15,
      priority: 'Calm',
      subtasks: [],
      createdAt: yesterdayISO,
    },
    {
      id: 'task-8',
      title: 'Prepare Friday studio critique slides',
      notes: 'Keep deck to 8 focused frames showing typography hierarchy and interaction states.',
      completed: false,
      date: tomorrowISO,
      time: '09:30',
      timeBlock: 'Morning',
      category: 'Studio',
      durationMinutes: 45,
      priority: 'Important',
      subtasks: [
        { id: 'st-8', title: 'Export component state captures', completed: false },
        { id: 'st-9', title: 'Write 2-line rationale per frame', completed: false },
      ],
      createdAt: todayISO,
    },
    {
      id: 'task-9',
      title: 'Schedule dental hygiene checkup',
      notes: 'Ask for an early morning slot next month.',
      completed: false,
      date: tomorrowISO,
      time: '13:30',
      timeBlock: 'Afternoon',
      category: 'Personal',
      durationMinutes: 15,
      priority: 'Calm',
      subtasks: [],
      createdAt: todayISO,
    },
    {
      id: 'task-10',
      title: 'Refactor local persistence backup export',
      notes: 'Allow one-tap JSON export of weekly completed log.',
      completed: false,
      date: dayAfterISO,
      time: '10:00',
      timeBlock: 'Morning',
      category: 'Deep Work',
      durationMinutes: 45,
      priority: 'Calm',
      subtasks: [],
      createdAt: todayISO,
    },
    {
      id: 'task-11',
      title: 'Return library architecture monographs',
      notes: 'Two books due by Friday closing.',
      completed: false,
      date: threeDaysISO,
      time: '16:00',
      timeBlock: 'Afternoon',
      category: 'Errands',
      durationMinutes: 25,
      priority: 'Calm',
      subtasks: [],
      createdAt: todayISO,
    },
    {
      id: 'task-12',
      title: 'Organize analog sketchbook archive',
      notes: 'Labeled three notebooks from spring and summer.',
      completed: true,
      completedAt: new Date(Date.now() - 86400 * 1000).toISOString(),
      date: yesterdayISO,
      time: '18:00',
      timeBlock: 'Evening',
      category: 'Personal',
      durationMinutes: 25,
      priority: 'Calm',
      subtasks: [],
      createdAt: addDaysISO(todayISO, -2),
    },
    {
      id: 'task-13',
      title: 'Calibrate display warm white balance',
      notes: 'Matched studio monitor to D65 daylight preset.',
      completed: true,
      completedAt: new Date(Date.now() - 86400 * 1000 - 7200 * 1000).toISOString(),
      date: yesterdayISO,
      time: '09:15',
      timeBlock: 'Morning',
      category: 'Studio',
      durationMinutes: 15,
      priority: 'Calm',
      subtasks: [],
      createdAt: addDaysISO(todayISO, -2),
    },
  ];
}
