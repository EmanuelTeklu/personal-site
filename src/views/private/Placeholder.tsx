interface PlaceholderProps {
  readonly title: string;
  readonly description: string;
}

export function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <p className="text-sm text-zinc-500">{description}</p>
        <p className="text-xs text-zinc-600 mt-2">Phase 3-4 implementation</p>
      </div>
    </div>
  );
}
