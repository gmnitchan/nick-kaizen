import type { Task } from "../state/types";
import { updateTask, setActiveTask } from "../state/store";

type Props = {
  task: Task;
  isActive: boolean;
};

export default function TaskRow({ task, isActive }: Props) {
  function handleStart() {
    setActiveTask(task.id);
  }

  function handleDone() {
    updateTask(task.id, { status: "done", completedAt: Date.now() });
    setActiveTask(null);
  }

  function handleSkip() {
    updateTask(task.id, { status: "skipped" });
    if (isActive) setActiveTask(null);
  }

  if (task.status === "done" || task.status === "skipped") {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg bg-surface ${task.status === "done" ? "opacity-60" : "opacity-40"}`}>
        <span className="text-sm">{task.status === "done" ? "\u2713" : "\u2014"}</span>
        <span className={`flex-1 ${task.status === "done" ? "line-through" : ""}`}>
          {task.text}
        </span>
        {task.actualMin > 0 && (
          <span className="text-xs text-text-dim">{task.actualMin.toFixed(1)}m</span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${isActive ? "bg-surface border border-accent" : "bg-surface border border-border"}`}>
      <span className="flex-1 font-medium">{task.text}</span>

      {task.estimatedMin && (
        <span className="text-xs text-text-dim">{task.estimatedMin}m est</span>
      )}

      {task.actualMin > 0 && (
        <span className="text-xs text-accent">{task.actualMin.toFixed(1)}m</span>
      )}

      <div className="flex gap-1">
        {!isActive && (
          <button
            onClick={handleStart}
            className="text-xs px-2 py-1 rounded bg-accent text-bg font-medium hover:bg-accent-dim"
          >
            Start
          </button>
        )}
        {isActive && (
          <span className="text-xs px-2 py-1 text-accent font-medium animate-pulse">
            active
          </span>
        )}
        <button
          onClick={handleDone}
          className="text-xs px-2 py-1 rounded bg-green/20 text-green hover:bg-green/30"
        >
          Done
        </button>
        <button
          onClick={handleSkip}
          className="text-xs px-2 py-1 rounded bg-border text-text-dim hover:text-text"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
