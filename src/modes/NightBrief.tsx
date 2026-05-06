import { useState, useMemo } from "react";
import { useAppState, getOrCreateBrief, updateBrief, addTask, addTaskToBrief, moveTaskToSprint, getCarryoverTasks, carryTaskToBrief, deleteTask } from "../state/store";
import { tomorrowStr } from "../lib/date";
import { ALL_SPRINTS } from "../lib/sprints";
import { SPRINT_META } from "../lib/sprints";
import type { Sprint } from "../state/types";
import BrainDump from "../components/BrainDump";
import HighlightInput from "../components/HighlightInput";
import SprintColumn from "../components/SprintColumn";

export default function NightBrief() {
  const state = useAppState();
  const date = tomorrowStr();
  const brief = state.briefs[date] || getOrCreateBrief(date);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverSprint, setDragOverSprint] = useState<Sprint | null>(null);
  const [showBrainParse, setShowBrainParse] = useState(false);
  const [showCarryover, setShowCarryover] = useState(true);

  const tasksBySprint = useMemo(() => {
    const result = Object.fromEntries(ALL_SPRINTS.map((s) => [s, [] as typeof state.tasks[string][]])) as Record<Sprint, typeof state.tasks[string][]>;
    for (const id of brief.taskIds) {
      const task = state.tasks[id];
      if (task && task.status !== "skipped") {
        result[task.sprint].push(task);
      }
    }
    return result;
  }, [state.tasks, brief.taskIds]);

  const carryoverTasks = useMemo(() => getCarryoverTasks(date), [state.tasks, state.briefs, date]);

  const carryoverBySprint = useMemo(() => {
    const result = Object.fromEntries(ALL_SPRINTS.map((s) => [s, [] as typeof carryoverTasks])) as Record<Sprint, typeof carryoverTasks>;
    for (const task of carryoverTasks) {
      result[task.sprint].push(task);
    }
    return result;
  }, [carryoverTasks]);

  const totalTasks = brief.taskIds.length;

  function handleDrop(targetSprint: Sprint) {
    if (draggingTaskId) {
      moveTaskToSprint(draggingTaskId, targetSprint);
    }
    setDraggingTaskId(null);
    setDragOverSprint(null);
  }

  const brainLines = brief.brainDump
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  function sendToBrief(line: string, sprint: Sprint) {
    const task = addTask(line, sprint);
    addTaskToBrief(date, task.id);
  }

  function handleCarryTask(taskId: string) {
    carryTaskToBrief(date, taskId);
  }

  function handleCarryAll() {
    for (const task of carryoverTasks) {
      carryTaskToBrief(date, task.id);
    }
  }

  function handleDropTask(taskId: string) {
    deleteTask(taskId);
  }

  if (brief.locked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-6xl mb-6">&#10003;</div>
        <h1 className="text-3xl font-bold mb-4">You're set for tomorrow.</h1>
        <p className="text-text-dim text-lg mb-2">Close the laptop.</p>
        <p className="text-text-dim text-sm mt-6">
          When you open it tomorrow morning, you'll see your highlight and sprints ready to go.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-1 text-center">Night Brief</h1>
      <p className="text-text-dim text-sm text-center mb-8">
        Plan tomorrow in 5 minutes. Go top to bottom, then lock it in.
      </p>

      {/* Carryover section */}
      {carryoverTasks.length > 0 && showCarryover && (
        <div className="mb-8 bg-surface border border-yellow/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-yellow">
                {carryoverTasks.length} unfinished task{carryoverTasks.length !== 1 ? "s" : ""} from previous days
              </h2>
              <p className="text-text-dim text-xs mt-1">
                Carry them forward to tomorrow, or drop the ones you no longer need.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCarryAll}
                className="text-xs px-2 py-1 rounded bg-accent/20 text-accent hover:bg-accent/30"
              >
                Carry all forward
              </button>
              <button
                onClick={() => setShowCarryover(false)}
                className="text-xs text-text-dim hover:text-text"
              >
                Hide
              </button>
            </div>
          </div>

          {ALL_SPRINTS.map((sprint) => {
            const tasks = carryoverBySprint[sprint];
            if (tasks.length === 0) return null;
            return (
              <div key={sprint} className="mb-2">
                <p className="text-xs text-text-dim mb-1">{SPRINT_META[sprint].emoji} {SPRINT_META[sprint].label}</p>
                <div className="space-y-1">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 text-sm bg-bg rounded p-2 group">
                      <span className="flex-1 truncate">{task.text}</span>
                      {task.estimatedMin && (
                        <span className="text-xs text-text-dim">{task.estimatedMin}m</span>
                      )}
                      {task.actualMin > 0 && (
                        <span className="text-xs text-accent">{task.actualMin.toFixed(0)}m spent</span>
                      )}
                      <button
                        onClick={() => handleCarryTask(task.id)}
                        className="text-xs px-2 py-0.5 rounded bg-accent/20 text-accent hover:bg-accent/30"
                      >
                        Carry
                      </button>
                      <button
                        onClick={() => handleDropTask(task.id)}
                        className="text-xs px-2 py-0.5 rounded bg-red/20 text-red hover:bg-red/30 opacity-0 group-hover:opacity-100"
                      >
                        Drop
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {carryoverTasks.length > 0 && !showCarryover && (
        <button
          onClick={() => setShowCarryover(true)}
          className="text-xs text-yellow hover:text-yellow/80 mb-6 block"
        >
          Show {carryoverTasks.length} unfinished task{carryoverTasks.length !== 1 ? "s" : ""} from previous days
        </button>
      )}

      {/* Step 1 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-accent text-bg text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">1</span>
          <label className="text-text-dim text-sm uppercase tracking-wider">
            Brain Dump
          </label>
        </div>
        <p className="text-text-dim text-xs mb-3 ml-7">
          Get everything out of your head. Type or use the mic button to speak. Each line can become a task later.
        </p>
        <BrainDump
          value={brief.brainDump}
          onChange={(v) => updateBrief(date, { brainDump: v })}
        />
      </div>

      {/* Step 2 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-accent text-bg text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">2</span>
          <label className="text-text-dim text-sm uppercase tracking-wider">
            Tomorrow's Highlight
          </label>
        </div>
        <p className="text-text-dim text-xs mb-3 ml-7">
          If you only get ONE thing done tomorrow, what is it? This shows up big on your morning screen.
        </p>
        <HighlightInput
          value={brief.highlight}
          onChange={(v) => updateBrief(date, { highlight: v })}
        />
      </div>

      {/* Step 3 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-accent text-bg text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">3</span>
          <label className="text-text-dim text-sm uppercase tracking-wider">
            Sort Tasks Into Sprints
          </label>
        </div>
        <p className="text-text-dim text-xs mb-3 ml-7">
          Type tasks into each column below. You can drag tasks between columns to re-sort.
          {brainLines.length === 0 && " Or write your brain dump first, then pull lines from it."}
        </p>

        {brainLines.length > 0 && (
          <div className="ml-7 mb-3">
            <button
              onClick={() => setShowBrainParse(!showBrainParse)}
              className="text-xs text-accent hover:text-accent-dim border border-accent/30 rounded px-2 py-1"
            >
              {showBrainParse ? "Hide brain dump lines" : "Pull lines from brain dump into tasks"}
            </button>
          </div>
        )}

        {showBrainParse && (
          <div className="bg-surface border border-border rounded-lg p-3 mb-4 space-y-1">
            <p className="text-text-dim text-xs mb-2">Hover a line and click a sprint emoji to add it as a task:</p>
            {brainLines.map((line, i) => (
              <div key={i} className="flex items-center gap-2 text-sm group">
                <span className="flex-1 truncate text-text-dim">{line}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  {ALL_SPRINTS.map((sp) => (
                    <button
                      key={sp}
                      onClick={() => sendToBrief(line, sp)}
                      className="text-xs px-1.5 py-0.5 rounded bg-bg hover:bg-surface-hover border border-border"
                      title={`Add to ${SPRINT_META[sp].label}`}
                    >
                      {SPRINT_META[sp].emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          {ALL_SPRINTS.map((sprint) => (
            <SprintColumn
              key={sprint}
              sprint={sprint}
              tasks={tasksBySprint[sprint]}
              briefDate={date}
              onDragStart={setDraggingTaskId}
              onDrop={handleDrop}
              draggingOver={dragOverSprint === sprint}
            />
          ))}
        </div>
      </div>

      {/* Step 4: Lock */}
      <div className="text-center mt-10 mb-4">
        <div className="flex items-center gap-2 justify-center mb-3">
          <span className="bg-accent text-bg text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">4</span>
          <span className="text-text-dim text-sm uppercase tracking-wider">Lock it in</span>
        </div>
        {totalTasks === 0 && !brief.highlight ? (
          <p className="text-text-dim text-sm mb-4">
            Add a highlight and some tasks first, then lock in your plan.
          </p>
        ) : (
          <p className="text-text-dim text-sm mb-4">
            {brief.highlight ? `Highlight: "${brief.highlight}"` : "No highlight set yet."} · {totalTasks} task{totalTasks !== 1 ? "s" : ""} planned.
            {!brief.highlight && " Consider adding a highlight above."}
          </p>
        )}
        <button
          onClick={() => updateBrief(date, { locked: true })}
          disabled={totalTasks === 0 && !brief.highlight}
          className="bg-accent text-bg font-bold text-lg px-8 py-3 rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Lock in tomorrow
        </button>
      </div>
    </div>
  );
}
