import React, { useMemo } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { Task } from '../types/task';
import { formatShortDate } from '../data/seedTasks';

interface ArchiveScreenProps {
  tasks: Task[];
  todayISO: string;
  totalFocusedMinutes: number;
  onRestoreTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearAllCompleted: () => void;
}

export const ArchiveScreen: React.FC<ArchiveScreenProps> = ({
  tasks,
  todayISO,
  totalFocusedMinutes,
  onRestoreTask,
  onDeleteTask,
  onClearAllCompleted,
}) => {
  const completedTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.completed)
        .sort((a, b) => (b.completedAt || b.date).localeCompare(a.completedAt || a.date)),
    [tasks]
  );

  const groupedByDate = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    for (const t of completedTasks) {
      const key = t.date || todayISO;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [completedTasks, todayISO]);

  const completedTodayCount = completedTasks.filter((t) => t.date === todayISO).length;

  return (
    <div className="space-y-6">
      {/* Quiet Reflection Summary Row */}
      <div className="kanso-card p-4 sm:p-5 grid grid-cols-3 divide-x divide-[#E1E6DF] dark:divide-[#27342F]">
        <div className="pr-3">
          <p className="text-[12px] text-[#65776C] dark:text-[#7E9689]">Completed Today</p>
          <p className="mt-1 text-[22px] font-semibold tabular-nums text-[#19211C] dark:text-[#E6EBE7]">
            {completedTodayCount}
          </p>
        </div>
        <div className="px-3">
          <p className="text-[12px] text-[#65776C] dark:text-[#7E9689]">Total Archived</p>
          <p className="mt-1 text-[22px] font-semibold tabular-nums text-[#19211C] dark:text-[#E6EBE7]">
            {completedTasks.length}
          </p>
        </div>
        <div className="pl-3">
          <p className="text-[12px] text-[#65776C] dark:text-[#7E9689]">Focused Time</p>
          <p className="mt-1 text-[22px] font-semibold tabular-nums text-[#1F6F54] dark:text-[#4FB58C]">
            {totalFocusedMinutes}m
          </p>
        </div>
      </div>

      {/* Header + Clear Action */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-[#19211C] dark:text-[#E6EBE7]">
          Completed Log
        </h2>
        {completedTasks.length > 0 && (
          <button
            type="button"
            onClick={onClearAllCompleted}
            className="text-[13px] font-medium text-[#65776C] dark:text-[#7E9689] hover:text-[#ba1a1a] dark:hover:text-[#ffb4ab] transition-colors"
          >
            Clear completed
          </button>
        )}
      </div>

      {groupedByDate.length === 0 ? (
        <div className="kanso-card px-5 py-8 text-center">
          <p className="text-[15px] font-medium text-[#19211C] dark:text-[#E6EBE7]">
            Quiet log
          </p>
          <p className="mt-1 text-[13px] text-[#65776C] dark:text-[#7E9689]">
            Completed tasks appear here so you can reflect on steady progress.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedByDate.map(([dateISO, items]) => (
            <section key={dateISO} className="space-y-2">
              <h3 className="text-[12.5px] font-medium text-[#65776C] dark:text-[#7E9689]">
                {formatShortDate(dateISO, todayISO)}
              </h3>
              <div className="kanso-card divide-y divide-[#E1E6DF] dark:divide-[#27342F] overflow-hidden">
                {items.map((task) => (
                  <div
                    key={task.id}
                    className="px-4 py-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[14.5px] text-[#65776C] dark:text-[#7E9689] line-through break-words">
                        {task.title}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[#65776C]/80 dark:text-[#7E9689]/80 tabular-nums">
                        {task.category} · {task.durationMinutes}m
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onRestoreTask(task.id)}
                        aria-label={`Restore "${task.title}"`}
                        title="Restore to active list"
                        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-[10px] text-[#65776C] dark:text-[#7E9689] hover:text-[#1F6F54] dark:hover:text-[#4FB58C] hover:bg-[#F3F5F0] dark:hover:bg-[#121815] transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTask(task.id)}
                        aria-label={`Delete "${task.title}"`}
                        title="Delete permanently"
                        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-[10px] text-[#65776C] dark:text-[#7E9689] hover:text-[#ba1a1a] dark:hover:text-[#ffb4ab] hover:bg-[#ffdad6]/40 dark:hover:bg-[#491918]/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
