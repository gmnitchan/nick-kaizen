import { useState, useMemo, useEffect, useCallback } from "react";
import { useAppState, startSprintTimer, undo, canUndo, heartbeat, getStaleSprintInfo, endStaleSprint, getSprintDef } from "./state/store";
import { todayStr, tomorrowStr, currentHour } from "./lib/date";
import type { Sprint } from "./state/types";
import type { Mode } from "./components/ModeSwitcher";
import ModeSwitcher from "./components/ModeSwitcher";
import NightBrief from "./modes/NightBrief";
import MorningLaunch from "./modes/MorningLaunch";
import SprintBoard from "./modes/SprintBoard";
import StatsView from "./components/StatsView";
import SprintSettings from "./components/SprintSettings";
import Welcome from "./components/Welcome";
import HelpButton from "./components/HelpButton";

const WELCOMED_KEY = "nick_kaizen_welcomed";

function getDefaultMode(hasTodayBrief: boolean, hasTomorrowBrief: boolean): Mode {
  const hour = currentHour();
  if (hour >= 20 || !hasTomorrowBrief) return "night_brief";
  if (hour < 11 && hasTodayBrief) return "morning_launch";
  return "morning_launch";
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  const state = useAppState();
  const today = todayStr();
  const tomorrow = tomorrowStr();
  const [welcomed, setWelcomed] = useState(() => localStorage.getItem(WELCOMED_KEY) === "true");
  const [undoToast, setUndoToast] = useState(false);
  const [staleSprint, setStaleSprint] = useState<{ sprint: string; lastActiveAt: number; startedAt: number } | null>(null);

  const defaultMode = useMemo(
    () => getDefaultMode(!!state.briefs[today], !!state.briefs[tomorrow]),
    [] // only compute once on mount
  );

  const [mode, setMode] = useState<Mode>(defaultMode);

  // Heartbeat: update lastActiveAt every 30 seconds while page is open
  useEffect(() => {
    heartbeat(); // immediate on mount
    const id = setInterval(heartbeat, 30000);
    return () => clearInterval(id);
  }, []);

  // Check for stale sprint on mount
  useEffect(() => {
    const stale = getStaleSprintInfo();
    if (stale) {
      setStaleSprint(stale);
    }
  }, []);

  const handleUndo = useCallback(() => {
    if (canUndo()) {
      undo();
      setUndoToast(true);
      setTimeout(() => setUndoToast(false), 1500);
    }
  }, []);

  // Cmd+Z / Ctrl+Z listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        handleUndo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo]);

  function handleDismissWelcome() {
    localStorage.setItem(WELCOMED_KEY, "true");
    setWelcomed(true);
  }

  function handleStartSprint(sprint: Sprint) {
    startSprintTimer(sprint);
    setMode("sprint_board");
  }

  function handleEndStaleSprint() {
    if (staleSprint) {
      endStaleSprint(staleSprint.lastActiveAt);
      setStaleSprint(null);
    }
  }

  function handleResumeStaleSprint() {
    // Just dismiss the dialog — sprint keeps running, heartbeat resumes
    setStaleSprint(null);
    setMode("sprint_board");
  }

  if (!welcomed) {
    return <Welcome onDismiss={handleDismissWelcome} />;
  }

  // Stale sprint dialog
  if (staleSprint) {
    const def = getSprintDef(staleSprint.sprint);
    const duration = Math.round((staleSprint.lastActiveAt - staleSprint.startedAt) / 60000);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-[440px] text-center">
          <h1 className="text-2xl font-bold mb-4">You left a sprint running</h1>
          <p className="text-text-dim mb-2">
            {def?.emoji} {def?.label ?? staleSprint.sprint}
          </p>
          <p className="text-text-dim text-sm mb-1">
            Started at {formatTime(staleSprint.startedAt)}
          </p>
          <p className="text-text-dim text-sm mb-6">
            Last active at {formatTime(staleSprint.lastActiveAt)} ({duration} min logged)
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleEndStaleSprint}
              className="px-4 py-2 rounded-lg bg-accent text-bg font-medium hover:bg-accent-dim"
            >
              End sprint ({duration}m)
            </button>
            <button
              onClick={handleResumeStaleSprint}
              className="px-4 py-2 rounded-lg bg-surface border border-border text-text-dim hover:border-accent"
            >
              I'm still working
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="fixed top-0 right-0 p-4 z-50 flex items-center gap-3">
        <button
          onClick={handleUndo}
          disabled={!canUndo()}
          className="text-xs text-text-dim hover:text-text disabled:opacity-20 disabled:cursor-default"
          title="Undo (Cmd+Z)"
        >
          undo
        </button>
        <HelpButton />
        <button
          onClick={() => setMode("stats")}
          className="text-xs text-text-dim hover:text-text"
        >
          stats
        </button>
        <ModeSwitcher current={mode} onChange={setMode} />
      </div>

      {/* Undo toast */}
      {undoToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text shadow-lg">
          Undone
        </div>
      )}

      {mode === "night_brief" && <NightBrief />}
      {mode === "morning_launch" && <MorningLaunch onStartSprint={handleStartSprint} />}
      {mode === "sprint_board" && <SprintBoard onExit={() => setMode("morning_launch")} />}
      {mode === "stats" && <StatsView />}
      {mode === "sprint_settings" && <SprintSettings />}
      {mode === "welcome" && <Welcome onDismiss={() => setMode("morning_launch")} />}
    </div>
  );
}
