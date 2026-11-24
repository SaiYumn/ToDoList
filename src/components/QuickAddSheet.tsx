import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import {
  CATEGORIES,
  DURATIONS,
  TIME_BLOCKS,
  TaskCategory,
  TaskPriority,
  TaskTimeBlock,
} from '../types/task';
import { addDaysISO } from '../data/seedTasks';

interface QuickAddSheetProps {
  isOpen: boolean;
  todayISO: string;
  initialDate?: string;
  onClose: () => void;
  onCreate: (payload: {
    title: string;
    notes: string;
    date: string;
    time?: string;
    timeBlock: TaskTimeBlock;
    category: TaskCategory;
    durationMinutes: number;
    priority: TaskPriority;
  }) => void;
}

export const QuickAddSheet: React.FC<QuickAddSheetProps> = ({
  isOpen,
  todayISO,
  initialDate,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(initialDate || todayISO);
  const [time, setTime] = useState('');
  const [timeBlock, setTimeBlock] = useState<TaskTimeBlock>('Morning');
  const [category, setCategory] = useState<TaskCategory>('Deep Work');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [priority, setPriority] = useState<TaskPriority>('Calm');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDate(initialDate || todayISO);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen, initialDate, todayISO]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onCreate({
      title: trimmed,
      notes: notes.trim(),
      date,
      time: time || undefined,
      timeBlock,
      category,
      durationMinutes,
      priority,
    });
    setTitle('');
    setNotes('');
    setTime('');
    setPriority('Calm');
    onClose();
  };

  const tomorrowISO = addDaysISO(todayISO, 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/35 dark:bg-black/60 backdrop-blur-[2px] p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-heading"
    >
      <div
        className="kanso-elevated w-full sm:max-w-[460px] rounded-t-[20px] sm:rounded-[14px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <span className="w-10 h-1 rounded-full bg-[#E1E6DF] dark:bg-[#27342F]" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E1E6DF] dark:border-[#27342F]">
            <h2
              id="quick-add-heading"
              className="text-[16px] font-semibold text-[#19211C] dark:text-[#E6EBE7] tracking-[-0.01em]"
            >
              New Task
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close new task sheet"
              className="min-w-[40px] min-h-[40px] -mr-2 flex items-center justify-center rounded-[10px] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
            <div>
              <label htmlFor="quick-add-title" className="sr-only">
                Task title
              </label>
              <input
                ref={inputRef}
                id="quick-add-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What deserves your focus?"
                className="w-full kanso-input px-3.5 py-2.5 text-[15px] font-medium placeholder:text-[#65776C] dark:placeholder:text-[#7E9689]"
              />
            </div>

            <div>
              <label htmlFor="quick-add-notes" className="sr-only">
                Notes
              </label>
              <textarea
                id="quick-add-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes or context..."
                className="w-full kanso-input px-3.5 py-2.5 text-[14px] resize-none placeholder:text-[#65776C]/80 dark:placeholder:text-[#7E9689]/80"
              />
            </div>

            <div className="space-y-2">
              <span className="block text-[12px] font-medium text-[#65776C] dark:text-[#7E9689]">
                When
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDate(todayISO)}
                  className={`h-[34px] px-3.5 rounded-full text-[13px] font-medium transition-all ${
                    date === todayISO
                      ? 'kanso-chip-active'
                      : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689]'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDate(tomorrowISO)}
                  className={`h-[34px] px-3.5 rounded-full text-[13px] font-medium transition-all ${
                    date === tomorrowISO
                      ? 'kanso-chip-active'
                      : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689]'
                  }`}
                >
                  Tomorrow
                </button>
                <input
                  type="date"
                  value={date}
                  aria-label="Custom date"
                  onChange={(e) => setDate(e.target.value)}
                  className="h-[34px] kanso-input px-3 text-[13px] tabular-nums"
                />
                <input
                  type="time"
                  value={time}
                  aria-label="Time"
                  onChange={(e) => setTime(e.target.value)}
                  className="h-[34px] kanso-input px-3 text-[13px] tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="block text-[12px] font-medium text-[#65776C] dark:text-[#7E9689]">
                Time Block
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TIME_BLOCKS.map((block) => (
                  <button
                    key={block}
                    type="button"
                    onClick={() => setTimeBlock(block)}
                    className={`h-[34px] px-3.5 rounded-full text-[13px] font-medium transition-all ${
                      timeBlock === block
                        ? 'kanso-chip-active'
                        : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689]'
                    }`}
                  >
                    {block}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="block text-[12px] font-medium text-[#65776C] dark:text-[#7E9689]">
                Area
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`h-[34px] px-3.5 rounded-full text-[13px] font-medium transition-all ${
                      category === cat
                        ? 'kanso-chip-active'
                        : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689]'
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
                      onClick={() => setDurationMinutes(mins)}
                      className={`h-[32px] px-3 rounded-full text-[12.5px] font-medium tabular-nums transition-all ${
                        durationMinutes === mins
                          ? 'kanso-chip-active'
                          : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689]'
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
                      onClick={() => setPriority(p)}
                      className={`h-[32px] px-3 rounded-full text-[12.5px] font-medium transition-all ${
                        priority === p
                          ? 'kanso-chip-active'
                          : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-3.5 border-t border-[#E1E6DF] dark:border-[#27342F] bg-[#F8FAF5] dark:bg-[#161E1A] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-[10px] border border-[#E1E6DF] dark:border-[#27342F] text-[13.5px] font-medium text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="h-10 px-5 rounded-[10px] bg-[#1F6F54] hover:bg-[#175440] dark:bg-[#4FB58C] dark:hover:bg-[#62C39C] disabled:opacity-40 text-white dark:text-[#121815] text-[13.5px] font-medium transition-colors"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
