export type TaskCategory =
  | 'Deep Work'
  | 'Personal'
  | 'Errands'
  | 'Mindfulness'
  | 'Studio';

export type TaskTimeBlock = 'Morning' | 'Afternoon' | 'Evening' | 'Unscheduled';

export type TaskPriority = 'Calm' | 'Important';

export type AppScreen = 'today' | 'upcoming' | 'focus' | 'archive';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  completedAt?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  timeBlock: TaskTimeBlock;
  category: TaskCategory;
  durationMinutes: number;
  priority: TaskPriority;
  subtasks: Subtask[];
  createdAt: string;
}

export const CATEGORIES: TaskCategory[] = [
  'Deep Work',
  'Personal',
  'Studio',
  'Errands',
  'Mindfulness',
];

export const TIME_BLOCKS: TaskTimeBlock[] = [
  'Morning',
  'Afternoon',
  'Evening',
  'Unscheduled',
];

export const DURATIONS: number[] = [15, 25, 45, 60];
