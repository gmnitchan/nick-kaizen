export type Sprint = string;

export type SprintDef = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  status: "active" | "archived";
  archivedAt: number | null;
};

export type Task = {
  id: string;
  text: string;
  sprint: Sprint;
  estimatedMin: number | null;
  actualMin: number;
  status: "pending" | "done" | "skipped";
  createdAt: number;
  completedAt: number | null;
};

export type DailyBrief = {
  date: string; // "YYYY-MM-DD" local time
  brainDump: string;
  highlight: string;
  taskIds: string[];
  locked: boolean;
  createdAt: number;
};

export type DayLog = {
  date: string;
  laptopOpenedAt: number | null;
  morningRitual: {
    gym: boolean;
    light: boolean;
    shower: boolean;
    ate: boolean;
  };
  highlightCompleted: boolean;
  sprintsWorked: Sprint[];
};

export type AppState = {
  sprintDefs: Record<string, SprintDef>;
  tasks: Record<string, Task>;
  briefs: Record<string, DailyBrief>;
  logs: Record<string, DayLog>;
  currentSprintTimer: {
    sprint: Sprint | null;
    startedAt: number | null;
    activeTaskId: string | null;
  };
};
