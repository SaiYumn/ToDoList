import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Task, Subtask, TaskCategory, TaskPriority, TaskTimeBlock } from '../types/task';

export interface TaskRow {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  completed_at?: string | null;
  date: string;
  time?: string | null;
  time_block: string;
  category: string;
  duration_minutes: number;
  priority: string;
  subtasks: Subtask[];
  created_at: string;
}

export function taskRowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes || '',
    completed: Boolean(row.completed),
    completedAt: row.completed_at || undefined,
    date: row.date,
    time: row.time || undefined,
    timeBlock: (row.time_block as TaskTimeBlock) || 'Morning',
    category: (row.category as TaskCategory) || 'Deep Work',
    durationMinutes: Number(row.duration_minutes) || 25,
    priority: (row.priority as TaskPriority) || 'Calm',
    subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
    createdAt: row.created_at,
  };
}

export function taskToRow(task: Partial<Task>): Partial<TaskRow> {
  const row: Partial<TaskRow> = {};
  if (task.id !== undefined) row.id = task.id;
  if (task.title !== undefined) row.title = task.title;
  if (task.notes !== undefined) row.notes = task.notes;
  if (task.completed !== undefined) row.completed = task.completed;
  if (task.completedAt !== undefined) row.completed_at = task.completedAt || null;
  if (task.date !== undefined) row.date = task.date;
  if (task.time !== undefined) row.time = task.time || null;
  if (task.timeBlock !== undefined) row.time_block = task.timeBlock;
  if (task.category !== undefined) row.category = task.category;
  if (task.durationMinutes !== undefined) row.duration_minutes = task.durationMinutes;
  if (task.priority !== undefined) row.priority = task.priority;
  if (task.subtasks !== undefined) row.subtasks = task.subtasks;
  if (task.createdAt !== undefined) row.created_at = task.createdAt;
  return row;
}

/**
 * READ: Fetch all tasks from Supabase ordered by creation date descending
 */
export async function getTasksFromSupabase(): Promise<Task[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks from Supabase:', error);
    throw error;
  }

  return (data as TaskRow[]).map(taskRowToTask);
}

/**
 * CREATE: Insert a new task into Supabase
 */
export async function createTaskInSupabase(task: Task): Promise<Task> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const row = taskToRow(task);
  const { data, error } = await supabase
    .from('tasks')
    .insert([row])
    .select()
    .single();

  if (error) {
    console.error('Error creating task in Supabase:', error);
    throw error;
  }

  return taskRowToTask(data as TaskRow);
}

/**
 * UPDATE: Update an existing task in Supabase
 */
export async function updateTaskInSupabase(task: Task): Promise<Task> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const row = taskToRow(task);
  const { data, error } = await supabase
    .from('tasks')
    .update(row)
    .eq('id', task.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task in Supabase:', error);
    throw error;
  }

  return taskRowToTask(data as TaskRow);
}

/**
 * DELETE: Remove a task from Supabase by id
 */
export async function deleteTaskFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task from Supabase:', error);
    throw error;
  }
}

/**
 * DELETE ALL COMPLETED: Clear all completed tasks from Supabase
 */
export async function clearCompletedTasksFromSupabase(): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('completed', true);

  if (error) {
    console.error('Error clearing completed tasks from Supabase:', error);
    throw error;
  }
}

/**
 * RESET / SEED: Replace database tasks with clean test data
 */
export async function resetWithTestDataInSupabase(tasks: Task[]): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  // Clear existing tasks
  const { error: delError } = await supabase
    .from('tasks')
    .delete()
    .neq('id', '');

  if (delError) {
    console.error('Error clearing tasks prior to seeding:', delError);
    throw delError;
  }

  // Insert fresh test tasks
  const rows = tasks.map(taskToRow);
  const { error: insError } = await supabase
    .from('tasks')
    .insert(rows);

  if (insError) {
    console.error('Error inserting test tasks:', insError);
    throw insError;
  }
}
