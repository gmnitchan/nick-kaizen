import { useState } from "react";
import type { Sprint, Task } from "../state/types";
import { addTask, deleteTask, updateTask, addTaskToBrief, getSprintDef } from "../state/store";

type Props = {
  sprint: Sprint;
  tasks: Task[];
  briefDate: string;
  onDragStart: (taskId: string) => void;
  onDrop: (sprint: Sprint) => void;
  draggingOver: boolean;
};

export default function SprintColumn({ sprint, tasks, briefDate, onDragStart, onDrop, draggingOver }: Props) {
  const [newText, setNewText] = useState("");
  const def = getSprintDef(sprint);

  function handleAdd() {
    const text = newText.trim();
    if (!text) return;
    const task = addTask(text, sprint);
    addTaskToBrief(briefDate, task.id);
    setNewText("");
  }

  function handleEstimate(taskId: string, val: string) {
    const num = parseInt(val);
    updateTask(taskId, { estimatedMin: isNaN(num) ? null : num });
  }

  return (
    <div
      className={`flex-1 min-w-[130px] bg-surface rounded-lg p-3 border ${draggingOver ? "border-accent" : "border-border"}`}
      onDragOver={(e) => { e.preventDefault(); }}
      onDrop={(e) => { e.preventDefault(); onDrop(sprint); }}
    >
      <h3 className="text-sm font-semibold mb-3 text-center">
        {def?.emoji} {def?.label ?? sprint}
      </h3>

      <div className="space-y-2 mb-3 min-h-[40px]">
        {tasks.length === 0 && (
          <p className="text-text-dim text-xs text-center py-2 italic">Type below to add</p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={() => onDragStart(task.id)}
            className="bg-bg rounded p-2 text-sm flex items-center gap-2 cursor-grab active:cursor-grabbing group"
          >
            <span className="flex-1 truncate">{task.text}</span>
            <input
              type="text"
              placeholder="min"
              value={task.estimatedMin ?? ""}
              onChange={(e) => handleEstimate(task.id, e.target.value)}
              className="w-12 bg-surface border border-border rounded px-1 py-0.5 text-xs text-center text-text-dim focus:outline-none focus:border-accent"
            />
            <button
              onClick={() => deleteTask(task.id)}
              className="text-text-dim hover:text-red opacity-0 group-hover:opacity-100 text-xs"
            >
              x
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add task..."
          className="flex-1 min-w-0 bg-bg border border-border rounded px-2 py-1 text-sm text-text focus:outline-none focus:border-accent"
        />
      </div>
    </div>
  );
}
