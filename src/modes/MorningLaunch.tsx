import { useState } from "react";
import { useAppState, recordLaptopOpen, updateLog, getOrCreateLog, getActiveSprints } from "../state/store";
import { todayStr, daysAgo } from "../lib/date";
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
  const activeSprints = getActiveSprints();
  const [brainDump, setBrainDump] = useState(log.morningBrainDump || "");
  const [showBrainDump, setShowBrainDump] = useState(!log.morningBrainDump);

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
    const counts: Record<string, number> = {};
    for (const sp of activeSprints) counts[sp.id] = 0;
    if (!brief) return counts;
    for (const id of brief.taskIds) {
      const task = state.tasks[id];
      if (task && task.status === "pending") {
        counts[task.sprint] = (counts[task.sprint] || 0) + 1;
      }
    }
    return counts;
  }, [brief, state.tasks, state.sprintDefs]);

  const ritualKeys = ["gym", "feed_birds", "meditation", "consume_art"] as const;
  const ritualLabels: Record<string, string> = {
    gym: "Gym",
    feed_birds: "Feed Birds",
    meditation: "Meditation",
    consume_art: "Consume Art",
  };

  function toggleRitual(key: typeof ritualKeys[number]) {
    updateLog(today, {
      morningRitual: { ...log.morningRitual, [key]: !log.morningRitual[key] },
    });
  }

  function saveBrainDump() {
    updateLog(today, { morningBrainDump: brainDump });
    setShowBrainDump(false);
  }

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
        <p className="text-text-dim text-xs uppercase tracking-wider mb-3">What energy are you in?</p>
        <div className="flex gap-4 mb-6 flex-wrap justify-center">
          {activeSprints.map((sp) => (
            <button
              key={sp.id}
              onClick={() => onStartSprint(sp.id)}
              className="bg-surface border border-border rounded-lg px-6 py-4 hover:border-accent transition-colors text-center min-w-[140px]"
            >
              <div className="text-2xl mb-1">{sp.emoji}</div>
              <div className="text-sm font-medium">{sp.label}</div>
              <div className="text-xs text-text-dim mt-1">{sp.description}</div>
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

      {/* Morning brain dump */}
      {showBrainDump && (
        <div className="w-full max-w-[500px] mb-8">
          <p className="text-text-dim text-xs uppercase tracking-wider mb-2 text-center">Clear your head</p>
          <textarea
            value={brainDump}
            onChange={(e) => setBrainDump(e.target.value)}
            placeholder="What's loud in your mind right now? Dump it here, then let it go."
            className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-text resize-none focus:outline-none focus:border-accent min-h-[80px]"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={saveBrainDump}
              className="text-xs text-accent hover:text-accent-dim"
            >
              {brainDump.trim() ? "Done, let it go" : "Skip"}
            </button>
          </div>
        </div>
      )}

      {!showBrainDump && !log.morningBrainDump && (
        <button
          onClick={() => setShowBrainDump(true)}
          className="text-xs text-text-dim hover:text-text mb-6"
        >
          Clear your head first?
        </button>
      )}

      {/* Sprint picker - energy based */}
      <p className="text-text-dim text-xs uppercase tracking-wider mb-3">What energy are you in?</p>
      <div className="flex gap-4 mb-8 flex-wrap justify-center">
        {activeSprints.map((sp) => (
          <button
            key={sp.id}
            onClick={() => onStartSprint(sp.id)}
            className="bg-surface border border-border rounded-lg px-5 py-4 hover:border-accent transition-colors text-center min-w-[130px] max-w-[160px]"
          >
            <div className="text-2xl mb-1">{sp.emoji}</div>
            <div className="text-sm font-medium">{sp.label}</div>
            <div className="text-xs text-text-dim mt-1 leading-tight">{sp.description}</div>
            {(taskCounts[sp.id] || 0) > 0 && (
              <div className="text-xs text-accent mt-2">
                {taskCounts[sp.id]} task{taskCounts[sp.id] !== 1 ? "s" : ""}
              </div>
            )}
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
