type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function HighlightInput({ value, onChange }: Props) {
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border border-border rounded-lg p-4 text-text text-2xl font-semibold focus:outline-none focus:border-accent"
        placeholder="e.g. Ship the landing page"
      />
    </div>
  );
}
