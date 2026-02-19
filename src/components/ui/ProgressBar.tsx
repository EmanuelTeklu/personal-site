interface ProgressBarProps {
  readonly value: number;
  readonly max: number;
  readonly color: string;
}

export function ProgressBar({ value, max, color }: ProgressBarProps) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);

  return (
    <div className="w-full bg-zinc-800 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}
