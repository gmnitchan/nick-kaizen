import { useElapsedSeconds, formatTimer } from "../lib/timer";

type Props = {
  startedAt: number | null;
};

export default function Timer({ startedAt }: Props) {
  const elapsed = useElapsedSeconds(startedAt);

  return (
    <span className="font-mono text-2xl text-accent tabular-nums">
      {formatTimer(elapsed)}
    </span>
  );
}
