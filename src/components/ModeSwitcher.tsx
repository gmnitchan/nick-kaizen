export type Mode = "night_brief" | "morning_launch" | "sprint_board" | "stats" | "sprint_settings" | "welcome";

const MODE_LABELS: Record<Mode, string> = {
  night_brief: "Night Brief",
  morning_launch: "Morning Launch",
  sprint_board: "Sprint Board",
  stats: "Stats",
  sprint_settings: "Sprint Settings",
  welcome: "Welcome Guide",
};

type Props = {
  current: Mode;
  onChange: (mode: Mode) => void;
};

export default function ModeSwitcher({ current, onChange }: Props) {
  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value as Mode)}
      className="bg-surface border border-border rounded px-2 py-1 text-sm text-text-dim focus:outline-none focus:border-accent cursor-pointer"
    >
      {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
        <option key={m} value={m}>
          {MODE_LABELS[m]}
        </option>
      ))}
    </select>
  );
}
