import { useAppState, recordLaptopOpen, updateLog, getOrCreateLog } from "../state/store";
import { todayStr, daysAgo } from "../lib/date";
import { ALL_SPRINTS, SPRINT_META } from "../lib/sprints";
import type { Sprint } from "../state/types";
import { useEffect, useMemo } from "react";

type Props = {
  onStartSprint: (sprint: Sprint) => void;
};

export default function MorningLaunch({ onStartSprint }: Props) {
  const state = useAppState();
  const today = todayStr();
  const brief = state.briefs[today];
  const log = state.logs[today] || getOrCreateLog(today);

  useEffect(() => {
    recordLaptopOpen(today);
  }, [today]);

  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 365; i++) {
      const d = daysAgo(i);
      if (state.briefs[d]) count++;
      else break;
    }
    return count;
  }, [state.briefs]);

  const taskCounts = useMemo(() => {
    const counts: Record<Sprint, number> = { soberin_revenue: 0, outreach: 0, build_mode: 0, admin: 0 };
    if (!brief) return counts;
    for (const id of brief.taskIds) {
      const task = state.tasks[id];
      if (task && task.status === "pending") {
        counts[task.sprint]++;
      }
    }
    return counts;
  }, [brief, state.tasks]);

  const totalPending = Object.values(taskCounts).reduce((a, b) => a + b, 0);

  const ritualKeys = ["gym", "light", "shower", "ate"] as const;
  const ritualLabels: Record<string, string> = {
    gym: "Gym",
    light: "Sunlight",
    shower: "Shower",
    ate: "Ate",
  };

  function toggleRitual(key: typeof ritualKeys[number]) {
    updateLog(today, {
      morningRitual: { ...log.morningRitual, [key]: !log.morningRitual[key] },
    });
  }

  // No brief for today
  if (!brief) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-3xl font-bold mb-4">No brief for today</h1>
        <p className="text-text-dim text-lg mb-2">
          You didn't file a Night Brief last night.
        </p>
        <p className="text-text-dim text-sm mb-8">
          Switch to Night Brief mode (top right dropdown) to plan today, or just pick a sprint below and start working.
        </p>
        <div className="flex gap-4 mb-6">
          {ALL_SPRINTS.map((sprint) => (
            <button
              key={sprint}
              onClick={() => onStartSprint(sprint)}
              className="bg-surface border border-border rounded-lg px-6 py-4 hover:border-accent transition-colors text-center"
            >
              <div className="text-2xl mb-1">{SPRINT_META[sprint].emoji}</div>
              <div className="text-sm font-medium">{SPRINT_META[sprint].label}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {streak > 0 && (
        <p className="text-text-dim text-sm mb-4">
          Day {streak} of brief streak
        </p>
      )}

      <p className="text-text-dim text-xs uppercase tracking-wider mb-3">
        Today's highlight
      </p>

      <h1 className="text-5xl font-bold mb-6 text-center max-w-[800px] leading-tight">
        {brief.highlight || "No highlight set"}
      </h1>

      <p className="text-text-dim text-sm mb-8">
        {totalPending > 0
          ? `You have ${totalPending} task${totalPending !== 1 ? "s" : ""} planned. Pick a sprint to start working.`
          : "Pick a sprint to start working."}
      </p>

      <div className="flex gap-4 mb-8">
        {ALL_SPRINTS.map((sprint) => (
          <button
            key={sprint}
            onClick={() => onStartSprint(sprint)}
            className="bg-surface border border-border rounded-lg px-6 py-4 hover:border-accent transition-colors text-center min-w-[130px]"
          >
            <div className="text-2xl mb-1">{SPRINT_META[sprint].emoji}</div>
            <div className="text-sm font-medium">{SPRINT_META[sprint].label}</div>
            <div className="text-xs text-text-dim mt-1">
              {taskCounts[sprint]} task{taskCounts[sprint] !== 1 ? "s" : ""}
            </div>
          </button>
        ))}
      </div>

      <div className="mb-6">
        <p className="text-text-dim text-xs uppercase tracking-wider mb-2 text-center">Morning ritual</p>
        <div className="flex gap-6">
          {ritualKeys.map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm text-text-dim cursor-pointer select-none">
              <input
                type="checkbox"
                checked={log.morningRitual[key]}
                onChange={() => toggleRitual(key)}
                className="accent-accent w-4 h-4"
              />
              {ritualLabels[key]}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
