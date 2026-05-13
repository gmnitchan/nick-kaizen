import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAppState, endSprintTimer, startSprintTimer, accumulateTaskTime, addTask, addTaskToBrief, updateTask, updateLog, getOrCreateLog, getActiveSprints, getSprintDef, getLatestBrief } from "../state/store";
import { todayStr, currentHour } from "../lib/date";
import type { Sprint } from "../state/types";
import Timer from "../components/Timer";

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes of no interaction = idle

type Props = {
  onExit: () => void;
};

export default function SprintBoard({ onExit }: Props) {
  const state = useAppState();
  const { sprint, startedAt } = state.currentSprintTimer;
  const today = todayStr();
  const brief = getLatestBrief();
  const log = state.logs[today];
  const [newText, setNewText] = useState("");
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const lastInteractionRef = useRef(Date.now());
  const lastTickRef = useRef(Date.now());
  const activeSprints = getActiveSprints();

  // Track user interaction (mouse, keyboard, clicks)
  const markActive = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (isIdle) setIsIdle(false);
  }, [isIdle]);

  useEffect(() => {
    window.addEventListener("mousemove", markActive);
    window.addEventListener("keydown", markActive);
    window.addEventListener("click", markActive);
    return () => {
      window.removeEventListener("mousemove", markActive);
      window.removeEventListener("keydown", markActive);
      window.removeEventListener("click", markActive);
    };
  }, [markActive]);

  // Check for idle every 30 seconds
  useEffect(() => {
    const id = setInterval(() => {
      const gap = Date.now() - lastInteractionRef.current;
      if (gap > IDLE_TIMEOUT) {
        setIsIdle(true);
      }
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // Accumulate time ONLY when user is active
  useEffect(() => {
    if (!sprint || !startedAt) return;
    lastTickRef.current = Date.now();
    const id = setInterval(() => {
      // Skip accumulation if idle
      if (Date.now() - lastInteractionRef.current > IDLE_TIMEOUT) {
        lastTickRef.current = Date.now();
        return;
      }
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 60000;
      lastTickRef.current = now;
      const pending = tasks.filter((t) => t.status === "pending");
      if (pending.length > 0) {
        const perTask = delta / pending.length;
        pending.forEach((t) => accumulateTaskTime(t.id, perTask));
      }
    }, 15000);
    return () => clearInterval(id);
  }, [sprint, startedAt, state.tasks]);

  const tasks = useMemo(() => {
    if (!brief || !sprint) return [];
    return brief.taskIds
      .map((id) => state.tasks[id])
      .filter((t) => t && t.sprint === sprint);
  }, [brief, sprint, state.tasks]);

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const doneTasks = tasks.filter((t) => t.status === "done");

  const highlightNudge = useMemo(() => {
    if (!brief?.highlight || log?.highlightCompleted) return false;
    const deadline = log?.highlightDeadline || "16:00";
    const [h, m] = deadline.split(":").map(Number);
    const now = new Date();
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
  }, [brief, log, currentHour()]);

  function handleEnd() {
    if (brief?.highlight) {
      const highlightDone = Object.values(state.tasks).some(
        (t) => t.status === "done" && t.text === brief.highlight
      );
      if (highlightDone) {
        const dayLog = getOrCreateLog(today);
        if (!dayLog.highlightCompleted) {
          updateLog(today, { highlightCompleted: true });
        }
      }
    }
    endSprintTimer(today);
    setShowEndConfirm(false);
    onExit();
  }

  function handleAdd() {
    const text = newText.trim();
    if (!text || !sprint || !brief) return;
    const task = addTask(text, sprint);
    addTaskToBrief(brief.date, task.id);
    setNewText("");
  }

  function handleSwitchSprint(s: Sprint) {
    endSprintTimer(today);
    startSprintTimer(s);
  }

  function handleCheck(taskId: string) {
    updateTask(taskId, { status: "done", completedAt: Date.now() });
  }

  function handleSkip(taskId: string) {
    updateTask(taskId, { status: "skipped" });
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
    <div className="max-w-[640px] mx-auto py-8 px-4">
      {/* Highlight banner */}
      {brief?.highlight && (
        <div className={`text-center mb-6 py-3 px-4 rounded-lg ${highlightNudge ? "bg-yellow/10 border border-yellow/40" : "bg-surface/50"}`}>
          {highlightNudge && (
            <p className="text-yellow text-xs uppercase tracking-wider mb-1">Have you done your highlight yet?</p>
          )}
          <p className={`text-sm ${highlightNudge ? "text-yellow font-medium" : "text-text-dim"}`}>
            Highlight: {brief.highlight}
          </p>
        </div>
      )}

      {/* Sprint header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">
            {def?.emoji} {def?.label ?? sprint}
          </h1>
          <Timer startedAt={startedAt} />
          {isIdle && (
            <span className="text-xs text-yellow px-2 py-0.5 rounded bg-yellow/10">paused — idle</span>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={sprint}
            onChange={(e) => handleSwitchSprint(e.target.value)}
            className="bg-surface border border-border rounded px-2 py-1 text-xs text-text-dim focus:outline-none cursor-pointer"
          >
            {activeSprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.emoji} {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowEndConfirm(true)}
            className="text-xs px-2 py-1 rounded bg-border text-text-dim hover:text-text"
          >
            Done with sprint
          </button>
        </div>
      </div>

      {/* End confirmation */}
      {showEndConfirm && (
        <div className="bg-surface border border-border rounded-lg p-4 mb-6 text-center">
          <p className="text-sm mb-3">End this sprint session?</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleEnd} className="text-sm px-4 py-1.5 rounded bg-accent text-bg font-medium hover:bg-accent-dim">
              Yes, I'm done
            </button>
            <button onClick={() => setShowEndConfirm(false)} className="text-sm text-text-dim hover:text-text">
              Keep going
            </button>
          </div>
        </div>
      )}

      {/* Task checklist */}
      <div className="space-y-1.5 mb-4">
        {pendingTasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-surface/50 group">
            <button
              onClick={() => handleCheck(task.id)}
              className="w-5 h-5 rounded border-2 border-border group-hover:border-accent shrink-0 flex items-center justify-center"
            />
            <span className="flex-1">{task.text}</span>
            <button
              onClick={() => handleSkip(task.id)}
              className="text-xs text-text-dim hover:text-text opacity-0 group-hover:opacity-100"
            >
              skip
            </button>
          </div>
        ))}

        {doneTasks.length > 0 && (
          <div className="pt-3 border-t border-border/50 mt-3">
            {doneTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 py-1.5 px-3 opacity-40">
                <span className="w-5 h-5 rounded border-2 border-green bg-green/20 shrink-0 flex items-center justify-center text-green text-xs">
                  &#10003;
                </span>
                <span className="flex-1 line-through">{task.text}</span>
              </div>
            ))}
          </div>
        )}

        {tasks.length === 0 && (
          <p className="text-text-dim text-sm text-center py-8">No tasks. Add one below or just flow.</p>
        )}
      </div>

      {/* Add task */}
      <input
        type="text"
        value={newText}
        onChange={(e) => setNewText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        placeholder="Add a task... (press Enter)"
        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
      />
    </div>
  );
}
