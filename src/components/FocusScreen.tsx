import React, { useEffect, useMemo, useState } from 'react';
import { Check, Pause, Play, RotateCcw } from 'lucide-react';
import { DURATIONS, Task } from '../types/task';

interface FocusScreenProps {
  tasks: Task[];
  activeTask: Task | null;
  onSelectFocusTask: (task: Task | null) => void;
  onCompleteTask: (id: string) => void;
  onRecordFocusMinutes: (minutes: number) => void;
}

export const FocusScreen: React.FC<FocusScreenProps> = ({
  tasks,
  activeTask,
  onSelectFocusTask,
  onCompleteTask,
  onRecordFocusMinutes,
}) => {
  const pendingTasks = useMemo(
    () => tasks.filter((t) => !t.completed),
    [tasks]
  );

  const initialDuration = activeTask?.durationMinutes || 25;
  const [durationMinutes, setDurationMinutes] = useState<number>(initialDuration);
  const [secondsLeft, setSecondsLeft] = useState<number>(initialDuration * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showBreathCue, setShowBreathCue] = useState<boolean>(true);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  // Sync timer duration when switching active task while idle
  useEffect(() => {
    if (!isRunning && activeTask) {
      const mins = activeTask.durationMinutes || 25;
      setDurationMinutes(mins);
      setSecondsLeft(mins * 60);
      setSessionCompleted(false);
    }
  }, [activeTask?.id]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);
          setSessionCompleted(true);
          onRecordFocusMinutes(durationMinutes);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, durationMinutes, onRecordFocusMinutes]);

  const handleSelectDuration = (mins: number) => {
    setIsRunning(false);
    setSessionCompleted(false);
    setDurationMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSessionCompleted(false);
    setSecondsLeft(durationMinutes * 60);
  };

  const totalSeconds = durationMinutes * 60;
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const minutesDisplay = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secondsDisplay = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="space-y-5">
      {/* Main Focus Timer Card */}
      <div className="kanso-card p-6 sm:p-8 flex flex-col items-center text-center">
        <div className="w-full max-w-md space-y-1.5">
          <p className="text-[12px] font-medium text-[#65776C] dark:text-[#7E9689]">
            {activeTask ? `${activeTask.category} · Single-task focus` : 'Quiet Focus Session'}
          </p>
          <h2 className="text-[20px] leading-[28px] font-semibold tracking-[-0.01em] text-[#19211C] dark:text-[#E6EBE7] text-balance">
            {activeTask ? activeTask.title : 'Choose a task below or start an open session'}
          </h2>
        </div>

        {/* Circular SVG Gauge */}
        <div className="relative my-7 flex items-center justify-center">
          <svg
            width="220"
            height="220"
            viewBox="0 0 220 220"
            className="-rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              className="stroke-[#E1E6DF] dark:stroke-[#27342F]"
              strokeWidth="4"
            />
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              className="stroke-[#1F6F54] dark:stroke-[#4FB58C] transition-[stroke-dashoffset] duration-300 ease-out"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono-tabular text-[40px] leading-[46px] font-medium tracking-[-0.02em] text-[#19211C] dark:text-[#E6EBE7]">
              {minutesDisplay}:{secondsDisplay}
            </span>
            <span className="mt-1.5 text-[12px] text-[#65776C] dark:text-[#7E9689]">
              {sessionCompleted
                ? 'Session complete'
                : isRunning
                ? 'In progress'
                : 'Ready'}
            </span>
          </div>
        </div>

        {/* Duration Selector Chips */}
        <div className="flex items-center gap-1.5 mb-6">
          {DURATIONS.map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => handleSelectDuration(mins)}
              className={`h-[34px] px-3.5 rounded-full text-[13px] font-medium tabular-nums transition-all ${
                durationMinutes === mins
                  ? 'kanso-chip-active'
                  : 'border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Primary Timer Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset timer"
            className="min-w-[44px] h-11 px-3.5 rounded-[12px] border border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7] flex items-center justify-center gap-1.5 text-[13.5px] font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          <button
            type="button"
            onClick={() => {
              if (secondsLeft === 0) {
                setSecondsLeft(durationMinutes * 60);
                setSessionCompleted(false);
              }
              setIsRunning((prev) => !prev);
            }}
            className="h-11 px-6 rounded-[12px] bg-[#1F6F54] hover:bg-[#175440] dark:bg-[#4FB58C] dark:hover:bg-[#62C39C] text-white dark:text-[#121815] text-[14px] font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                {secondsLeft < totalSeconds && secondsLeft > 0 ? 'Resume' : 'Start Focus'}
              </>
            )}
          </button>

          {activeTask && !activeTask.completed && (
            <button
              type="button"
              onClick={() => {
                setIsRunning(false);
                onCompleteTask(activeTask.id);
              }}
              className="h-11 px-4 rounded-[12px] border border-[#E1E6DF] dark:border-[#27342F] text-[#19211C] dark:text-[#E6EBE7] hover:border-[#1F6F54] dark:hover:border-[#4FB58C] text-[13.5px] font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Check className="w-4 h-4 text-[#1F6F54] dark:text-[#4FB58C]" />
              Complete Task
            </button>
          )}
        </div>

        {/* Optional Grounding Cadence Line */}
        <div className="mt-6 pt-4 border-t border-[#E1E6DF] dark:border-[#27342F] w-full flex items-center justify-between gap-2 text-[12px] text-[#65776C] dark:text-[#7E9689]">
          <span>
            {showBreathCue
              ? 'Grounding rhythm: Inhale 4s · Hold 4s · Exhale 6s'
              : 'Grounding rhythm hidden'}
          </span>
          <button
            type="button"
            onClick={() => setShowBreathCue((prev) => !prev)}
            className="underline underline-offset-2 hover:text-[#19211C] dark:hover:text-[#E6EBE7] shrink-0"
          >
            {showBreathCue ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* Switch Focus Task List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-medium text-[#65776C] dark:text-[#7E9689]">
            Select Task for Focus
          </h3>
          {activeTask && (
            <button
              type="button"
              onClick={() => onSelectFocusTask(null)}
              className="text-[12px] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]"
            >
              Clear selection
            </button>
          )}
        </div>

        {pendingTasks.length === 0 ? (
          <div className="kanso-card p-4 text-[14px] text-[#65776C] dark:text-[#7E9689]">
            All tasks are complete. Use the timer above for open reflection or reading.
          </div>
        ) : (
          <div className="space-y-2">
            {pendingTasks.slice(0, 6).map((task) => {
              const selected = activeTask?.id === task.id;
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onSelectFocusTask(task)}
                  className={`w-full text-left px-4 py-3 rounded-[12px] transition-all flex items-center justify-between gap-3 ${
                    selected
                      ? 'bg-[#FFFFFF] dark:bg-[#1B2420] border border-[#1F6F54] dark:border-[#4FB58C] shadow-[0_0_0_3px_rgba(31,111,84,0.10)]'
                      : 'kanso-card hover:border-[#BEC9C2] dark:hover:border-[#364740]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-medium text-[#19211C] dark:text-[#E6EBE7] truncate">
                      {task.title}
                    </p>
                    <p className="text-[12px] text-[#65776C] dark:text-[#7E9689] mt-0.5 tabular-nums">
                      {task.category} · {task.durationMinutes}m
                    </p>
                  </div>
                  <span className="text-[12px] font-medium text-[#1F6F54] dark:text-[#4FB58C] shrink-0">
                    {selected ? 'Selected' : 'Select'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
