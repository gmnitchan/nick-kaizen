import { useSyncExternalStore } from "react";
import type { AppState, Task, DailyBrief, DayLog, Sprint, SprintDef } from "./types";
import { DEFAULT_SPRINTS } from "../lib/sprints";

const STORAGE_KEY = "nick_kaizen_state_v1";

function defaultSprintDefs(): Record<string, SprintDef> {
  const defs: Record<string, SprintDef> = {};
  for (const d of DEFAULT_SPRINTS) {
    defs[d.id] = d;
  }
  return defs;
}

function defaultState(): AppState {
  return {
    sprintDefs: defaultSprintDefs(),
    tasks: {},
    briefs: {},
    logs: {},
    currentSprintTimer: {
      sprint: null,
      startedAt: null,
      activeTaskId: null,
    },
  };
}

function migrateState(raw: AppState): AppState {
  // Add sprintDefs if missing (upgrading from old data)
  if (!raw.sprintDefs) {
    raw.sprintDefs = defaultSprintDefs();
  }
  // Add any new default sprints that don't exist yet
  for (const d of DEFAULT_SPRINTS) {
    if (!raw.sprintDefs[d.id]) {
      raw.sprintDefs[d.id] = d;
    }
  }
  return raw;
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateState(JSON.parse(raw) as AppState);
  } catch {
    // corrupted — start fresh
  }
  return defaultState();
}

let state = loadState();
const listeners = new Set<() => void>();
const undoStack: AppState[] = [];
const MAX_UNDO = 50;

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

function update(fn: (s: AppState) => AppState) {
  undoStack.push(state);
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  state = fn(state);
  persist();
}

export function undo(): boolean {
  const prev = undoStack.pop();
  if (!prev) return false;
  state = prev;
  persist();
  return true;
}

export function canUndo(): boolean {
  return undoStack.length > 0;
}

export function getState(): AppState {
  return state;
}

export function replaceState(newState: AppState) {
  state = newState;
  persist();
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state
  );
}

// ---- Sprint helpers ----

export function getActiveSprints(): SprintDef[] {
  return Object.values(state.sprintDefs).filter((d) => d.status === "active");
}

export function getActiveSprintIds(): string[] {
  return getActiveSprints().map((d) => d.id);
}

export function getArchivedSprints(): SprintDef[] {
  return Object.values(state.sprintDefs).filter((d) => d.status === "archived");
}

export function getSprintDef(id: string): SprintDef | undefined {
  return state.sprintDefs[id];
}

// ---- Sprint management ----

export function addSprintDef(label: string, emoji: string, description: string): SprintDef {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const def: SprintDef = { id, label, emoji, description, status: "active", archivedAt: null };
  update((s) => ({ ...s, sprintDefs: { ...s.sprintDefs, [id]: def } }));
  return def;
}

export function updateSprintDef(id: string, patch: Partial<SprintDef>) {
  update((s) => ({
    ...s,
    sprintDefs: { ...s.sprintDefs, [id]: { ...s.sprintDefs[id], ...patch } },
  }));
}

export function archiveSprint(id: string) {
  updateSprintDef(id, { status: "archived", archivedAt: Date.now() });
}

export function restoreSprint(id: string) {
  updateSprintDef(id, { status: "active", archivedAt: null });
}

// ---- Task actions ----

export function addTask(text: string, sprint: Sprint, estimatedMin: number | null = null): Task {
  const task: Task = {
    id: crypto.randomUUID(),
    text,
    sprint,
    estimatedMin,
    actualMin: 0,
    status: "pending",
    createdAt: Date.now(),
    completedAt: null,
  };
  update((s) => ({ ...s, tasks: { ...s.tasks, [task.id]: task } }));
  return task;
}

export function updateTask(id: string, patch: Partial<Task>) {
  update((s) => ({
    ...s,
    tasks: { ...s.tasks, [id]: { ...s.tasks[id], ...patch } },
  }));
}

export function deleteTask(id: string) {
  update((s) => {
    const { [id]: _, ...rest } = s.tasks;
    const briefs = { ...s.briefs };
    for (const key in briefs) {
      const b = briefs[key];
      if (b.taskIds.includes(id)) {
        briefs[key] = { ...b, taskIds: b.taskIds.filter((t) => t !== id) };
      }
    }
    return { ...s, tasks: rest, briefs };
  });
}

export function moveTaskToSprint(id: string, sprint: Sprint) {
  updateTask(id, { sprint });
}

// ---- Brief actions ----

export function getOrCreateBrief(date: string): DailyBrief {
  if (state.briefs[date]) return state.briefs[date];
  const brief: DailyBrief = {
    date,
    brainDump: "",
    highlight: "",
    taskIds: [],
    locked: false,
    createdAt: Date.now(),
  };
  update((s) => ({ ...s, briefs: { ...s.briefs, [date]: brief } }));
  return brief;
}

export function updateBrief(date: string, patch: Partial<DailyBrief>) {
  update((s) => ({
    ...s,
    briefs: { ...s.briefs, [date]: { ...s.briefs[date], ...patch } },
  }));
}

export function addTaskToBrief(date: string, taskId: string) {
  const brief = state.briefs[date];
  if (!brief || brief.taskIds.includes(taskId)) return;
  updateBrief(date, { taskIds: [...brief.taskIds, taskId] });
}

// ---- DayLog actions ----

export function getOrCreateLog(date: string): DayLog {
  if (state.logs[date]) return state.logs[date];
  const log: DayLog = {
    date,
    laptopOpenedAt: null,
    morningRitual: { gym: false, light: false, shower: false, ate: false },
    highlightCompleted: false,
    sprintsWorked: [],
  };
  update((s) => ({ ...s, logs: { ...s.logs, [date]: log } }));
  return log;
}

export function updateLog(date: string, patch: Partial<DayLog>) {
  update((s) => ({
    ...s,
    logs: { ...s.logs, [date]: { ...s.logs[date], ...patch } },
  }));
}

export function recordLaptopOpen(date: string) {
  const log = getOrCreateLog(date);
  if (!log.laptopOpenedAt) {
    updateLog(date, { laptopOpenedAt: Date.now() });
  }
}

// ---- Sprint timer actions ----

export function startSprintTimer(sprint: Sprint) {
  update((s) => ({
    ...s,
    currentSprintTimer: { sprint, startedAt: Date.now(), activeTaskId: null },
  }));
}

export function setActiveTask(taskId: string | null) {
  update((s) => ({
    ...s,
    currentSprintTimer: { ...s.currentSprintTimer, activeTaskId: taskId },
  }));
}

export function accumulateTaskTime(taskId: string, minutes: number) {
  update((s) => ({
    ...s,
    tasks: {
      ...s.tasks,
      [taskId]: {
        ...s.tasks[taskId],
        actualMin: s.tasks[taskId].actualMin + minutes,
      },
    },
  }));
}

export function endSprintTimer(date: string) {
  const sprint = state.currentSprintTimer.sprint;
  if (sprint) {
    const log = getOrCreateLog(date);
    if (!log.sprintsWorked.includes(sprint)) {
      updateLog(date, { sprintsWorked: [...log.sprintsWorked, sprint] });
    }
  }
  update((s) => ({
    ...s,
    currentSprintTimer: { sprint: null, startedAt: null, activeTaskId: null },
  }));
}

// ---- Carryover ----

export function getCarryoverTasks(targetDate: string): Task[] {
  const targetBrief = state.briefs[targetDate];
  const alreadyInBrief = new Set(targetBrief?.taskIds || []);
  const seen = new Set<string>();
  const carryover: Task[] = [];

  const sortedDates = Object.keys(state.briefs).sort().reverse();
  for (const date of sortedDates) {
    if (date >= targetDate) continue;
    const brief = state.briefs[date];
    for (const taskId of brief.taskIds) {
      if (seen.has(taskId) || alreadyInBrief.has(taskId)) continue;
      seen.add(taskId);
      const task = state.tasks[taskId];
      if (task && task.status === "pending") {
        carryover.push(task);
      }
    }
  }

  return carryover;
}

export function carryTaskToBrief(date: string, taskId: string) {
  addTaskToBrief(date, taskId);
}

// ---- Export/Import ----

export function exportState(): string {
  return JSON.stringify(state, null, 2);
}

export function importState(json: string) {
  const parsed = JSON.parse(json) as AppState;
  replaceState(parsed);
}
