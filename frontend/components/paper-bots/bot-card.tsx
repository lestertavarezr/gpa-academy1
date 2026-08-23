import type { PaperBot } from '@/lib/api';
import { SimulatedBadge } from './simulated-badge';

const STATUS_LABEL: Record<PaperBot['status'], string> = {
  active: 'Activo',
  paused: 'Pausado',
  stopped_kill_switch: 'Detenido (kill switch)',
};

const STATUS_CLASSES: Record<PaperBot['status'], string> = {
  active: 'bg-emerald-950/60 border-emerald-700 text-emerald-300',
  paused: 'bg-slate-800 border-slate-600 text-slate-300',
  stopped_kill_switch: 'bg-red-950/60 border-red-700 text-red-300',
};

export function BotCard({
  bot,
  selected,
  onSelect,
  onPause,
  onDelete,
}: {
  bot: PaperBot;
  selected: boolean;
  onSelect: () => void;
  onPause: () => void;
  onDelete: () => void;
}) {
  const pnlColor = bot.pnl_pct >= 0 ? 'text-emerald-400' : 'text-red-400';

  return (
    <div
      className={`rounded-lg border p-4 ${selected ? 'border-blue-500 bg-slate-900' : 'border-slate-800 bg-slate-900/60'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button onClick={onSelect} className="text-left">
          <span className="text-lg font-semibold">{bot.symbol}</span>
          <span className="ml-2 text-xs text-slate-500">#{bot.id}</span>
        </button>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[bot.status]}`}>
          {STATUS_LABEL[bot.status]}
        </span>
      </div>

      <div className="mt-3">
        <SimulatedBadge />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-slate-400">Capital virtual actual</span>
          <p className="font-mono">${bot.current_equity.toFixed(2)}</p>
        </div>
        <div>
          <span className="text-slate-400">P&amp;L acumulado</span>
          <p className={`font-mono ${pnlColor}`}>
            {bot.pnl_pct >= 0 ? '+' : ''}
            {bot.pnl_pct.toFixed(2)}%
          </p>
        </div>
        <div>
          <span className="text-slate-400">Estrategia</span>
          <p className="font-mono text-xs">
            score &gt; {bot.buy_score_threshold} / &lt; {bot.sell_score_threshold}
          </p>
        </div>
        <div>
          <span className="text-slate-400">Kill switch</span>
          <p className="font-mono text-xs">-{bot.kill_switch_pct}% drawdown</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={onSelect}
          className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium hover:bg-slate-700"
        >
          Ver detalle
        </button>
        {bot.status === 'active' && (
          <button
            onClick={onPause}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium hover:bg-slate-700"
          >
            Pausar
          </button>
        )}
        <button
          onClick={onDelete}
          className="rounded-md bg-red-950 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-900"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
