import React, { useState } from 'react';
import {
  Play,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import {
  CATEGORIES,
  DURATIONS,
  TIME_BLOCKS,
  Task,
  TaskCategory,
  TaskPriority,
  TaskTimeBlock,
} from '../types/task';
import { addDaysISO } from '../data/seedTasks';
import { Checkbox } from './Checkbox';

interface TaskDetailPanelProps {
  task: Task;
  todayISO: string;
  onUpdate: (updated: Task) => void;
  onDelete: (id: string) => void;
  onStartFocus: (task: Task) => void;
  onClose: () => void;
  variant?: 'inspector' | 'sheet';
}

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  todayISO,
  onUpdate,
  onDelete,
  onStartFocus,
  onClose,
  variant = 'inspector',
}) => {
  const [newStepTitle, setNewStepTitle] = useState('');

  const updateField = <K extends keyof Task>(key: K, value: Task[K]) => {
    onUpdate({ ...task, [key]: value });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newStepTitle.trim();
    if (!trimmed) return;
    const next = [
      ...task.subtasks,
      {
        id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: trimmed,
        completed: false,
      },
    ];
    updateField('subtasks', next);
    setNewStepTitle('');
  };

  const toggleSubtask = (subId: string) => {
    const next = task.subtasks.map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    updateField('subtasks', next);
  };

  const removeSubtask = (subId: string) => {
    const next = task.subtasks.filter((s) => s.id !== subId);
    updateField('subtasks', next);
  };

  const tomorrowISO = addDaysISO(todayISO, 1);
  const nextWeekISO = addDaysISO(todayISO, 7);

  return (
    <div
      className={
        variant === 'sheet'
          ? 'kanso-elevated w-full max-h-[88vh] flex flex-col overflow-hidden rounded-t-[20px] sm:rounded-[16px]'
          : 'kanso-card flex flex-col overflow-hidden'
      }
    >
      {/* Top Drag Handle on Mobile Sheet */}
      {variant === 'sheet' && (
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <span className="w-10 h-1 rounded-full bg-[#E1E6DF] dark:bg-[#27342F]" />
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#E1E6DF] dark:border-[#27342F] shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Checkbox
            checked={task.completed}
            onChange={() =>
              onUpdate({
                ...task,
                completed: !task.completed,
                completedAt: !task.completed ? new Date().toISOString() : undefined,
              })
            }
            ariaLabel={task.completed ? 'Reopen task' : 'Complete task'}
          />
          <span className="text-[13px] font-medium text-[#65776C] dark:text-[#7E9689] truncate">
            {task.completed ? 'Completed' : 'Task details'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!task.completed && (
            <button
              type="button"
              onClick={() => onStartFocus(task)}
              className="h-9 px-3 rounded-[10px] bg-[#1F6F54] hover:bg-[#175440] dark:bg-[#4FB58C] dark:hover:bg-[#62C39C] text-white dark:text-[#121815] text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Focus
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task details"
            className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-[10px] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7] hover:bg-[#F3F5F0] dark:hover:bg-[#121815] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="p-4 space-y-5 overflow-y-auto">
        {/* Title & Notes */}
        <div className="space-y-3">
          <div>
            <label htmlFor="task-detail-title" className="sr-only">
              Task title
            </label>
            <input
              id="task-detail-title"
              type="text"
              value={task.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Task title"
              className={`w-full kanso-input px-3.5 py-2.5 text-[16px] font-medium ${
                task.completed ? 'line-through text-[#65776C] dark:text-[#7E9689]' : ''
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="task-detail-notes"
              className="block text-[12px] font-medium text-[#65776C] dark:text-[#7E9689] mb-1.5"
            >
              Notes
            </label>
            <textarea
              id="task-detail-notes"
              rows={3}
              value={task.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Add quiet context, links, or reflection notes..."
              className="w-full kanso-input px-3.5 py-2.5 text-[14px] leading-[21px] resize-none placeholder:text-[#65776C]/70 dark:placeholder:text-[#7E9689]/70"
            />
          </div>
        </div>

        {/* Sub-steps Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#65776C] dark:text-[#7E9689]">
              Steps
            </span>
            {task.subtasks.length > 0 && (
              <span className="text-[12px] text-[#65776C] dark:text-[#7E9689] tabular-nums">
                {task.subtasks.filter((s) => s.completed).length} of{' '}
                {task.subtasks.length}
              </span>
            )}
          </div>

          {task.subtasks.length > 0 && (
            <div className="divide-y divide-[#E1E6DF] dark:divide-[#27342F] border border-[#E1E6DF] dark:border-[#27342F] rounded-[12px] overflow-hidden bg-[#F8FAF5] dark:bg-[#161E1A]">
              {task.subtasks.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center gap-1 px-3 py-1"
                >
                  <Checkbox
                    size="sm"
                    checked={step.completed}
                    onChange={() => toggleSubtask(step.id)}
                    ariaLabel={`Toggle step "${step.title}"`}
                  />
                  <span
                    className={`flex-1 text-[14px] leading-[20px] py-1.5 break-words ${
                      step.completed
                        ? 'line-through text-[#65776C] dark:text-[#7E9689]'
                        : 'text-[#19211C] dark:text-[#E6EBE7]'
                    }`}
                  >
                    {step.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(step.id)}
                    aria-label={`Remove step "${step.title}"`}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#65776C] dark:text-[#7E9689] hover:text-[#ba1a1a] dark:hover:text-[#ffb4ab] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
            <input
              type="text"
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
              placeholder="Add a smaller step..."
              aria-label="Add smaller step"
              className="flex-1 kanso-input px-3 py-2 text-[14px] placeholder:text-[#65776C]/70 dark:placeholder:text-[#7E9689]/70"
            />
            <button
              type="submit"
              disabled={!newStepTitle.trim()}
              aria-label="Add step"
              className="min-w-[40px] min-h-[40px] rounded-[10px] border border-[#E1E6DF] dark:border-[#27342F] text-[#19211C] dark:text-[#E6EBE7] hover:border-[#1F6F54] dark:hover:border-[#4FB58C] disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Schedule & Time */}
        <div className="space-y-2.5 pt-2 border-t border-[#E1E6DF] dark:border-[#27342F]">
          <span className="block text-[12px] font-medium text-[#65776C] dark:text-[#7E9689]">
            Schedule
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: 'Today', iso: todayISO },
              { label: 'Tomorrow', iso: tomorrowISO },
              { label: 'Next Week', iso: nextWeekISO },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => updateField('date', preset.iso)}
                className={`h-[34px] px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
                  task.date === preset.iso
                    ? 'kanso-chip-active'
                    : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="task-detail-date"
                className="block text-[11px] font-medium text-[#65776C] dark:text-[#7E9689] mb-1"
              >
                Date
              </label>
              <input
                id="task-detail-date"
                type="date"
                value={task.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="w-full kanso-input px-3 py-2 text-[13px] tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="task-detail-time"
                className="block text-[11px] font-medium text-[#65776C] dark:text-[#7E9689] mb-1"
              >
                Time (optional)
              </label>
              <input
                id="task-detail-time"
                type="time"
                value={task.time || ''}
                onChange={(e) =>
                  updateField('time', e.target.value || undefined)
                }
                className="w-full kanso-input px-3 py-2 text-[13px] tabular-nums"
              />
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-medium text-[#65776C] dark:text-[#7E9689] mb-1.5">
              Time Block
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TIME_BLOCKS.map((block: TaskTimeBlock) => (
                <button
                  key={block}
                  type="button"
                  onClick={() => updateField('timeBlock', block)}
                  className={`h-[32px] px-3 rounded-full text-[12.5px] font-medium whitespace-nowrap transition-all ${
                    task.timeBlock === block
                      ? 'kanso-chip-active'
                      : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]'
                  }`}
                >
                  {block}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category, Duration & Priority */}
        <div className="space-y-3 pt-2 border-t border-[#E1E6DF] dark:border-[#27342F]">
          <div>
            <span className="block text-[12px] font-medium text-[#65776C] dark:text-[#7E9689] mb-1.5">
              Area
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat: TaskCategory) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => updateField('category', cat)}
                  className={`h-[34px] px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
                    task.category === cat
                      ? 'kanso-chip-active'
                      : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="block text-[12px] font-medium text-[#65776C] dark:text-[#7E9689] mb-1.5">
                Duration
              </span>
              <div className="flex items-center gap-1.5">
                {DURATIONS.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => updateField('durationMinutes', mins)}
                    className={`h-[32px] px-3 rounded-full text-[12.5px] font-medium tabular-nums whitespace-nowrap transition-all ${
                      task.durationMinutes === mins
                        ? 'kanso-chip-active'
                        : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-[12px] font-medium text-[#65776C] dark:text-[#7E9689] mb-1.5">
                Priority
              </span>
              <div className="flex items-center gap-1.5">
                {(['Calm', 'Important'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateField('priority', p)}
                    className={`h-[32px] px-3 rounded-full text-[12.5px] font-medium whitespace-nowrap transition-all ${
                      task.priority === p
                        ? 'kanso-chip-active'
                        : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-[#E1E6DF] dark:border-[#27342F] flex items-center justify-between gap-3 shrink-0 bg-[#F8FAF5] dark:bg-[#161E1A]">
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="h-10 px-3 rounded-[10px] text-[13px] font-medium text-[#ba1a1a] dark:text-[#ffb4ab] hover:bg-[#ffdad6]/50 dark:hover:bg-[#491918]/50 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>

        <button
          type="button"
          onClick={onClose}
          className="h-10 px-4 rounded-[10px] border border-[#E1E6DF] dark:border-[#27342F] bg-[#FFFFFF] dark:bg-[#1B2420] text-[13px] font-medium text-[#19211C] dark:text-[#E6EBE7] hover:border-[#1F6F54] dark:hover:border-[#4FB58C] transition-colors whitespace-nowrap"
        >
          Done
        </button>
      </div>
    </div>
  );
};
