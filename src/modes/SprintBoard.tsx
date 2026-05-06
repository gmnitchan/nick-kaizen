import { useState, useEffect, useRef, useMemo } from "react";
import { useAppState, endSprintTimer, startSprintTimer, accumulateTaskTime, addTask, addTaskToBrief, updateLog, getOrCreateLog, getActiveSprints, getSprintDef } from "../state/store";
import { todayStr } from "../lib/date";
import type { Sprint } from "../state/types";
import TaskRow from "../components/TaskRow";
import Timer from "../components/Timer";

type Props = {
  onExit: () => void;
};

export default function SprintBoard({ onExit }: Props) {
  const state = useAppState();
  const { sprint, startedAt, activeTaskId } = state.currentSprintTimer;
  const today = todayStr();
  const brief = state.briefs[today];
  const [newText, setNewText] = useState("");
  const lastTickRef = useRef(Date.now());
  const activeSprints = getActiveSprints();

  useEffect(() => {
    if (!activeTaskId || !startedAt) return;
    lastTickRef.current = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 60000;
      lastTickRef.current = now;
      accumulateTaskTime(activeTaskId, delta);
    }, 6000);
    return () => clearInterval(id);
  }, [activeTaskId, startedAt]);

  const tasks = useMemo(() => {
    if (!brief || !sprint) return [];
    return brief.taskIds
      .map((id) => state.tasks[id])
      .filter((t) => t && t.sprint === sprint);
  }, [brief, sprint, state.tasks]);

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  function handleEnd() {
    if (brief?.highlight) {
      const highlightDone = Object.values(state.tasks).some(
        (t) => t.status === "done" && t.text === brief.highlight
      );
      if (highlightDone) {
        const log = getOrCreateLog(today);
        if (!log.highlightCompleted) {
          updateLog(today, { highlightCompleted: true });
        }
      }
    }
    endSprintTimer(today);
    onExit();
  }

  function handleAdd() {
    const text = newText.trim();
    if (!text || !sprint) return;
    const task = addTask(text, sprint);
    addTaskToBrief(today, task.id);
    setNewText("");
  }

  function handleSwitchSprint(s: Sprint) {
    endSprintTimer(today);
    startSprintTimer(s);
  }

  if (!sprint) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-text-dim mb-2">No active sprint.</p>
        <p className="text-text-dim text-sm">Go to Morning Launch (top right dropdown) and pick a sprint to start.</p>
      </div>
    );
  }

  const def = getSprintDef(sprint);

  return (
    <div className="max-w-[720px] mx-auto py-8 px-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">
            {def?.emoji} {def?.label ?? sprint}
          </h1>
          <Timer startedAt={startedAt} />
        </div>
        <div className="flex gap-2">
          <select
            value={sprint}
            onChange={(e) => handleSwitchSprint(e.target.value)}
            className="bg-surface border border-border rounded px-2 py-1 text-sm text-text-dim focus:outline-none cursor-pointer"
          >
            {activeSprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.emoji} {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleEnd}
            className="text-sm px-3 py-1 rounded bg-red/20 text-red hover:bg-red/30"
          >
            End sprint
          </button>
        </div>
      </div>

      {/* Status line */}
      <p className="text-text-dim text-xs mb-6">
        {pendingCount > 0 && `${pendingCount} remaining`}
        {pendingCount > 0 && doneCount > 0 && " · "}
        {doneCount > 0 && `${doneCount} done`}
        {pendingCount === 0 && doneCount === 0 && "No tasks yet — add one below"}
        {!activeTaskId && pendingCount > 0 && " · Hit \"Start\" on a task to begin tracking time"}
      </p>

      {/* Task list */}
      <div className="space-y-2 mb-4">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} isActive={task.id === activeTaskId} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-dim text-sm mb-2">No tasks in this sprint yet.</p>
            <p className="text-text-dim text-xs">Type below to add one, or switch to a different sprint.</p>
          </div>
        )}
      </div>

      {/* Inline add */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a task... (press Enter)"
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
        />
      </div>
    </div>
  );
}
