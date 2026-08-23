import type { Contribution } from '@/lib/api';

export function ContributionsList({ contributions }: { contributions: Contribution[] }) {
  if (contributions.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Ningun indicador disparo una regla en este momento (mercado sin señales claras).
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {contributions.map((c) => (
        <li
          key={c.factor}
          className={`rounded-md border p-3 text-sm ${
            c.direction === 'bullish'
              ? 'border-emerald-800/60 bg-emerald-950/30'
              : 'border-red-800/60 bg-red-950/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{c.factor.replace(/_/g, ' ')}</span>
            <span className={c.direction === 'bullish' ? 'text-emerald-400' : 'text-red-400'}>
              {c.points > 0 ? `+${c.points}` : c.points} pts
            </span>
          </div>
          <p className="mt-1 text-slate-400">{c.rationale}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
            {Object.entries(c.indicators_used).map(([key, value]) => (
              <span key={key} className="rounded bg-slate-800 px-2 py-0.5 font-mono">
                {key}: {value ?? 'N/D'}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
