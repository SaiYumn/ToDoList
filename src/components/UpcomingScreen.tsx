import React, { useMemo, useState } from 'react';
import { Task, TaskCategory, TaskTimeBlock } from '../types/task';
import { formatHeaderDate, formatShortDate, getWeekDays } from '../data/seedTasks';
import { TaskCard } from './TaskCard';
import { InlineQuickAdd } from './InlineQuickAdd';

interface UpcomingScreenProps {
  tasks: Task[];
  todayISO: string;
  selectedTaskId: string | null;
  onToggleComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onQuickReschedule: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddInlineTask: (payload: {
    title: string;
    date: string;
    category: TaskCategory;
    timeBlock: TaskTimeBlock;
    durationMinutes: number;
  }) => void;
}

export const UpcomingScreen: React.FC<UpcomingScreenProps> = ({
  tasks,
  todayISO,
  selectedTaskId,
  onToggleComplete,
  onSelectTask,
  onStartFocus,
  onQuickReschedule,
  onDeleteTask,
  onAddInlineTask,
}) => {
  const weekDays = useMemo(() => getWeekDays(todayISO, 7), [todayISO]);
  const [selectedDayISO, setSelectedDayISO] = useState<string>(weekDays[1]?.iso || todayISO);

  const countByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of tasks) {
      if (!t.completed) {
        map[t.date] = (map[t.date] || 0) + 1;
      }
    }
    return map;
  }, [tasks]);

  const selectedDayTasks = useMemo(() => {
    return tasks
      .filter((t) => t.date === selectedDayISO)
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return (a.time || '99:99').localeCompare(b.time || '99:99');
      });
  }, [tasks, selectedDayISO]);

  const laterTasks = useMemo(() => {
    const lastWeekDayISO = weekDays[weekDays.length - 1]?.iso || todayISO;
    return tasks
      .filter((t) => t.date > lastWeekDayISO && !t.completed)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [tasks, weekDays, todayISO]);

  return (
    <div className="space-y-6">
      {/* Horizontal 7-Day Selector */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {weekDays.map((day) => {
          const isActive = day.iso === selectedDayISO;
          const count = countByDate[day.iso] || 0;
          return (
            <button
              key={day.iso}
              type="button"
              onClick={() => setSelectedDayISO(day.iso)}
              className={`min-w-[58px] px-3 py-2.5 rounded-[12px] flex flex-col items-center justify-center gap-0.5 transition-all shrink-0 ${
                isActive
                  ? 'kanso-chip-active border-[#1F6F54] dark:border-[#4FB58C]'
                  : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]'
              }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-[0.03em]">
                {day.isToday ? 'Today' : day.weekdayShort}
              </span>
              <span className="text-[16px] font-semibold tabular-nums text-[#19211C] dark:text-[#E6EBE7]">
                {day.dayNumber}
              </span>
              <span className="text-[11px] tabular-nums text-[#65776C] dark:text-[#7E9689]">
                {count > 0 ? `${count} due` : 'Clear'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Header & Quick Add */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-[#19211C] dark:text-[#E6EBE7]">
            {formatShortDate(selectedDayISO, todayISO)}
          </h2>
          <span className="text-[13px] text-[#65776C] dark:text-[#7E9689]">
            {formatHeaderDate(selectedDayISO)}
          </span>
        </div>

        <InlineQuickAdd
          defaultDate={selectedDayISO}
          onAdd={onAddInlineTask}
          placeholder={`Schedule a task for ${formatShortDate(selectedDayISO, todayISO)}...`}
        />
      </div>

      {/* Selected Day Task Cards */}
      {selectedDayTasks.length === 0 ? (
        <div className="kanso-card px-5 py-8 text-center">
          <p className="text-[15px] font-medium text-[#19211C] dark:text-[#E6EBE7]">
            Open space on this day
          </p>
          <p className="mt-1 text-[13px] text-[#65776C] dark:text-[#7E9689]">
            No tasks scheduled for {formatShortDate(selectedDayISO, todayISO)}. Use the field above to plan ahead calmly.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {selectedDayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              todayISO={todayISO}
              isSelected={selectedTaskId === task.id}
              onToggleComplete={onToggleComplete}
              onSelect={onSelectTask}
              onStartFocus={onStartFocus}
              onQuickReschedule={onQuickReschedule}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Beyond This Week */}
      {laterTasks.length > 0 && (
        <section className="pt-2 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-medium text-[#65776C] dark:text-[#7E9689]">
              Later Ahead
            </h3>
            <span className="text-[12px] text-[#65776C] dark:text-[#7E9689] tabular-nums">
              {laterTasks.length} scheduled
            </span>
          </div>
          <div className="space-y-2.5">
            {laterTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                todayISO={todayISO}
                showDate
                isSelected={selectedTaskId === task.id}
                onToggleComplete={onToggleComplete}
                onSelect={onSelectTask}
                onStartFocus={onStartFocus}
                onQuickReschedule={onQuickReschedule}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
