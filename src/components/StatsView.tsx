import { useMemo } from "react";
import { useAppState, exportState, importState } from "../state/store";
import { daysAgo, todayStr } from "../lib/date";
import { ALL_SPRINTS, SPRINT_META } from "../lib/sprints";

export default function StatsView() {
  const state = useAppState();
  const today = todayStr();

  // Last 14 days dots
  const dots = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const date = daysAgo(13 - i);
      const log = state.logs[date];
      if (!log?.laptopOpenedAt) return { date, color: "bg-border" }; // gray
      const openHour = new Date(log.laptopOpenedAt).getHours();
      if (openHour < 10) return { date, color: "bg-green" };
      if (openHour < 12) return { date, color: "bg-yellow" };
      return { date, color: "bg-red" };
    });
  }, [state.logs]);

  // Highlight completion rate
  const highlightRate = useMemo(() => {
    let total = 0;
    let completed = 0;
    for (let i = 0; i < 14; i++) {
      const date = daysAgo(i);
      const log = state.logs[date];
      const brief = state.briefs[date];
      if (brief?.highlight) {
        total++;
        if (log?.highlightCompleted) completed++;
      }
    }
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [state.logs, state.briefs]);

  // Estimated vs actual per sprint
  const sprintStats = useMemo(() => {
    return ALL_SPRINTS.map((sprint) => {
      let estTotal = 0;
      let actTotal = 0;
      Object.values(state.tasks).forEach((t) => {
        if (t.sprint === sprint && t.status === "done") {
          if (t.estimatedMin) estTotal += t.estimatedMin;
          actTotal += t.actualMin;
        }
      });
      return { sprint, estTotal, actTotal };
    });
  }, [state.tasks]);

  const maxTime = Math.max(...sprintStats.map((s) => Math.max(s.estTotal, s.actTotal)), 1);

  // Most avoided sprint
  const mostAvoided = useMemo(() => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const counts: Record<string, number> = {};
    ALL_SPRINTS.forEach((s) => (counts[s] = 0));
    Object.values(state.tasks).forEach((t) => {
      if (t.status === "pending" && t.createdAt < threeDaysAgo) {
        counts[t.sprint]++;
      }
    });
    const max = Math.max(...Object.values(counts));
    if (max === 0) return null;
    return ALL_SPRINTS.find((s) => counts[s] === max) || null;
  }, [state.tasks]);

  function handleExport() {
    const data = exportState();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nick-kaizen-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (confirm("This will replace all current data. Continue?")) {
          importState(reader.result as string);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  return (
    <div className="max-w-[720px] mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8 text-center">Stats</h1>

      {/* Laptop open dots */}
      <div className="mb-8">
        <h2 className="text-sm text-text-dim uppercase tracking-wider mb-3">Last 14 days — laptop open time</h2>
        <div className="flex gap-2 justify-center">
          {dots.map((d) => (
            <div
              key={d.date}
              className={`w-4 h-4 rounded-full ${d.color}`}
              title={d.date}
            />
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-2 text-xs text-text-dim">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green inline-block" /> &lt;10am</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow inline-block" /> 10-12</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red inline-block" /> &gt;12pm</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-border inline-block" /> none</span>
        </div>
      </div>

      {/* Est vs Actual */}
      <div className="mb-8">
        <h2 className="text-sm text-text-dim uppercase tracking-wider mb-3">Estimated vs Actual (completed tasks)</h2>
        <div className="space-y-3">
          {sprintStats.map(({ sprint, estTotal, actTotal }) => (
            <div key={sprint}>
              <div className="text-sm mb-1">{SPRINT_META[sprint].emoji} {SPRINT_META[sprint].label}</div>
              <div className="flex gap-1 items-center">
                <div className="h-4 bg-accent/30 rounded" style={{ width: `${(estTotal / maxTime) * 100}%`, minWidth: estTotal > 0 ? '4px' : 0 }} />
                <span className="text-xs text-text-dim w-16">{estTotal.toFixed(0)}m est</span>
              </div>
              <div className="flex gap-1 items-center">
                <div className="h-4 bg-accent rounded" style={{ width: `${(actTotal / maxTime) * 100}%`, minWidth: actTotal > 0 ? '4px' : 0 }} />
                <span className="text-xs text-text-dim w-16">{actTotal.toFixed(0)}m act</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Highlight rate */}
      <div className="mb-8">
        <h2 className="text-sm text-text-dim uppercase tracking-wider mb-2">Highlight completion (14 days)</h2>
        <p className="text-3xl font-bold">{highlightRate}%</p>
      </div>

      {/* Most avoided */}
      {mostAvoided && (
        <div className="mb-8">
          <h2 className="text-sm text-text-dim uppercase tracking-wider mb-2">Most avoided sprint</h2>
          <p className="text-lg">{SPRINT_META[mostAvoided].emoji} {SPRINT_META[mostAvoided].label}</p>
        </div>
      )}

      {/* Export/Import */}
      <div className="flex gap-4 justify-center mt-12">
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-surface border border-border rounded-lg text-sm hover:border-accent"
        >
          Export backup
        </button>
        <button
          onClick={handleImport}
          className="px-4 py-2 bg-surface border border-border rounded-lg text-sm hover:border-accent"
        >
          Import backup
        </button>
      </div>
    </div>
  );
}
