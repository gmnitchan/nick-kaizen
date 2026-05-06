import { useState, useMemo } from "react";
import { useAppState, startSprintTimer } from "./state/store";
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

export default function App() {
  const state = useAppState();
  const today = todayStr();
  const tomorrow = tomorrowStr();
  const [welcomed, setWelcomed] = useState(() => localStorage.getItem(WELCOMED_KEY) === "true");

  const defaultMode = useMemo(
    () => getDefaultMode(!!state.briefs[today], !!state.briefs[tomorrow]),
    [] // only compute once on mount
  );

  const [mode, setMode] = useState<Mode>(defaultMode);

  function handleDismissWelcome() {
    localStorage.setItem(WELCOMED_KEY, "true");
    setWelcomed(true);
  }

  function handleStartSprint(sprint: Sprint) {
    startSprintTimer(sprint);
    setMode("sprint_board");
  }

  if (!welcomed) {
    return <Welcome onDismiss={handleDismissWelcome} />;
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="fixed top-0 right-0 p-4 z-50 flex items-center gap-3">
        <HelpButton />
        <button
          onClick={() => setMode("stats")}
          className="text-xs text-text-dim hover:text-text"
        >
          stats
        </button>
        <ModeSwitcher current={mode} onChange={setMode} />
      </div>

      {mode === "night_brief" && <NightBrief />}
      {mode === "morning_launch" && <MorningLaunch onStartSprint={handleStartSprint} />}
      {mode === "sprint_board" && <SprintBoard onExit={() => setMode("morning_launch")} />}
      {mode === "stats" && <StatsView />}
      {mode === "sprint_settings" && <SprintSettings />}
    </div>
  );
}
