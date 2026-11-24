import React, { useRef, useState } from 'react';
import { Calendar, Play, Trash2 } from 'lucide-react';
import { Task } from '../types/task';
import { formatTimeDisplay, formatShortDate } from '../data/seedTasks';
import { Checkbox } from './Checkbox';

interface TaskCardProps {
  task: Task;
  todayISO: string;
  isSelected?: boolean;
  showDate?: boolean;
  onToggleComplete: (id: string) => void;
  onSelect: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onQuickReschedule: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  todayISO,
  isSelected = false,
  showDate = false,
  onToggleComplete,
  onSelect,
  onStartFocus,
  onQuickReschedule,
  onDelete,
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const timeLabel = formatTimeDisplay(task.time);
  const completedSteps = task.subtasks.filter((s) => s.completed).length;
  const totalSteps = task.subtasks.length;

  const metadataParts: string[] = [];
  if (showDate) {
    metadataParts.push(formatShortDate(task.date, todayISO));
  }
  if (timeLabel) {
    metadataParts.push(timeLabel);
  }
  metadataParts.push(task.category);
  if (task.durationMinutes > 0) {
    metadataParts.push(`${task.durationMinutes}m`);
  }
  if (totalSteps > 0) {
    metadataParts.push(`${completedSteps}/${totalSteps} steps`);
  }
  if (task.priority === 'Important' && !task.completed) {
    metadataParts.push('Priority');
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (isHorizontalSwipe.current === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
    }

    if (isHorizontalSwipe.current) {
      // Allow swiping left up to -116px to reveal Schedule & Delete
      const clamped = Math.max(-116, Math.min(0, dx));
      setSwipeOffset(clamped);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (swipeOffset < -54) {
      setSwipeOffset(-112);
    } else {
      setSwipeOffset(0);
    }
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = null;
  };

  const handleCardClick = () => {
    if (swipeOffset < -10) {
      setSwipeOffset(0);
      return;
    }
    onSelect(task);
  };

  return (
    <div className="relative overflow-hidden rounded-[12px]">
      {/* Swipe-revealed contextual actions (mobile touch) */}
      <div
        className="absolute inset-y-0 right-0 flex items-center gap-1.5 pr-2"
        aria-hidden={swipeOffset === 0}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSwipeOffset(0);
            onQuickReschedule(task.id);
          }}
          className="w-12 h-11 rounded-[10px] bg-[#ECEFEA] dark:bg-[#202B26] border border-[#E1E6DF] dark:border-[#27342F] text-[#19211C] dark:text-[#E6EBE7] flex items-center justify-center transition-colors hover:border-[#1F6F54] dark:hover:border-[#4FB58C]"
          aria-label="Move to tomorrow"
          title="Move to tomorrow"
        >
          <Calendar className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSwipeOffset(0);
            onDelete(task.id);
          }}
          className="w-12 h-11 rounded-[10px] bg-[#ffdad6] dark:bg-[#491918] border border-[#f5b7b1] dark:border-[#6e2625] text-[#93000a] dark:text-[#ffb4ab] flex items-center justify-center transition-colors"
          aria-label="Delete task"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Task Card Surface */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping
            ? 'none'
            : 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), border-color 150ms ease, box-shadow 150ms ease',
        }}
        className={`relative group flex items-start gap-1.5 rounded-[12px] px-4 py-[14px] cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6F54] dark:focus-visible:ring-[#4FB58C] ${
          isSelected
            ? 'bg-[#FFFFFF] dark:bg-[#1B2420] border border-[#1F6F54] dark:border-[#4FB58C] shadow-[0_0_0_3px_rgba(31,111,84,0.10)] dark:shadow-[0_0_0_3px_rgba(79,181,140,0.14)]'
            : 'kanso-card hover:border-[#BEC9C2] dark:hover:border-[#364740]'
        }`}
      >
        <div className="-my-2">
          <Checkbox
            checked={task.completed}
            onChange={() => onToggleComplete(task.id)}
            ariaLabel={
              task.completed
                ? `Mark "${task.title}" as incomplete`
                : `Mark "${task.title}" as complete`
            }
          />
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <p
            className={`text-[15px] leading-[22px] transition-colors duration-150 break-words ${
              task.completed
                ? 'line-through text-[#65776C] dark:text-[#7E9689] font-normal'
                : 'text-[#19211C] dark:text-[#E6EBE7] font-medium'
            }`}
          >
            {task.title}
          </p>

          {metadataParts.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12.5px] leading-[18px] text-[#65776C] dark:text-[#7E9689] tabular-nums">
              {metadataParts.map((part, idx) => (
                <React.Fragment key={`${part}-${idx}`}>
                  {idx > 0 && (
                    <span aria-hidden="true" className="opacity-60">
                      ·
                    </span>
                  )}
                  <span
                    className={
                      part === 'Priority'
                        ? 'text-[#1F6F54] dark:text-[#4FB58C] font-medium'
                        : undefined
                    }
                  >
                    {part}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Contextual Desktop Quick Actions (revealed calmly on hover/focus) */}
        <div className="hidden sm:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 shrink-0 -mr-1.5 -my-1.5">
          {!task.completed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartFocus(task);
              }}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#65776C] dark:text-[#7E9689] hover:text-[#1F6F54] dark:hover:text-[#4FB58C] hover:bg-[#F3F5F0] dark:hover:bg-[#121815] transition-colors"
              aria-label={`Focus on "${task.title}"`}
              title="Start focus session"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickReschedule(task.id);
            }}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7] hover:bg-[#F3F5F0] dark:hover:bg-[#121815] transition-colors"
            aria-label="Move to tomorrow"
            title="Move to tomorrow"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#65776C] dark:text-[#7E9689] hover:text-[#ba1a1a] dark:hover:text-[#ffb4ab] hover:bg-[#ffdad6]/40 dark:hover:bg-[#491918]/40 transition-colors"
            aria-label={`Delete "${task.title}"`}
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
