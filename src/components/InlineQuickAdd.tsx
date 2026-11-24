import React, { useState } from 'react';
import { Plus, SlidersHorizontal } from 'lucide-react';
import {
  CATEGORIES,
  DURATIONS,
  TIME_BLOCKS,
  TaskCategory,
  TaskTimeBlock,
} from '../types/task';

interface InlineQuickAddProps {
  defaultDate: string;
  onAdd: (payload: {
    title: string;
    date: string;
    category: TaskCategory;
    timeBlock: TaskTimeBlock;
    durationMinutes: number;
  }) => void;
  placeholder?: string;
}

export const InlineQuickAdd: React.FC<InlineQuickAddProps> = ({
  defaultDate,
  onAdd,
  placeholder = 'Add a calm intention or task...',
}) => {
  const [title, setTitle] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [category, setCategory] = useState<TaskCategory>('Deep Work');
  const [timeBlock, setTimeBlock] = useState<TaskTimeBlock>('Morning');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd({
      title: trimmed,
      date: defaultDate,
      category,
      timeBlock,
      durationMinutes,
    });
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="kanso-input p-1.5">
      <div className="flex items-center gap-1">
        <div className="min-w-[38px] min-h-[38px] flex items-center justify-center text-[#65776C] dark:text-[#7E9689] shrink-0">
          <Plus className="w-4 h-4" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={placeholder}
          aria-label="Quick add task"
          className="flex-1 min-w-0 bg-transparent py-2 text-[15px] text-[#19211C] dark:text-[#E6EBE7] placeholder:text-[#65776C] dark:placeholder:text-[#7E9689] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShowOptions((prev) => !prev)}
          aria-expanded={showOptions}
          aria-label="Toggle task options"
          className={`min-w-[38px] min-h-[38px] flex items-center justify-center rounded-[10px] transition-colors shrink-0 ${
            showOptions
              ? 'bg-[#ECEFEA] dark:bg-[#202B26] text-[#1F6F54] dark:text-[#4FB58C]'
              : 'text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        {title.trim().length > 0 && (
          <button
            type="submit"
            className="h-9 px-3.5 rounded-[10px] bg-[#1F6F54] hover:bg-[#175440] dark:bg-[#4FB58C] dark:hover:bg-[#62C39C] text-white dark:text-[#121815] text-[13px] font-medium transition-colors whitespace-nowrap shrink-0"
          >
            Add
          </button>
        )}
      </div>

      {showOptions && (
        <div className="px-2.5 pt-2 pb-1.5 mt-1 border-t border-[#E1E6DF] dark:border-[#27342F] flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-medium text-[#65776C] dark:text-[#7E9689] mr-1 shrink-0">
              Area
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`h-[30px] px-3 rounded-full text-[12px] font-medium whitespace-nowrap shrink-0 transition-all ${
                  category === cat
                    ? 'kanso-chip-active'
                    : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-medium text-[#65776C] dark:text-[#7E9689] mr-1 shrink-0">
                Block
              </span>
              {TIME_BLOCKS.map((block) => (
                <button
                  key={block}
                  type="button"
                  onClick={() => setTimeBlock(block)}
                  className={`h-[28px] px-2.5 rounded-full text-[12px] font-medium whitespace-nowrap shrink-0 transition-all ${
                    timeBlock === block
                      ? 'kanso-chip-active'
                      : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]'
                  }`}
                >
                  {block}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              {DURATIONS.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`h-[28px] px-2.5 rounded-full text-[12px] font-medium tabular-nums whitespace-nowrap shrink-0 transition-all ${
                    durationMinutes === mins
                      ? 'kanso-chip-active'
                      : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
