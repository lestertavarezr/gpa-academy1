import type { PaperTrade } from '@/lib/api';

export function TradeLogTable({ trades }: { trades: PaperTrade[] }) {
  if (trades.length === 0) {
    return <p className="text-sm text-slate-400">Este bot todavía no ejecutó ninguna operación.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-left text-slate-400">
            <th className="py-2 pr-4">Fecha</th>
            <th className="py-2 pr-4">Tipo</th>
            <th className="py-2 pr-4">Precio</th>
            <th className="py-2 pr-4">Cantidad</th>
            <th className="py-2 pr-4">Comisión</th>
            <th className="py-2">P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {[...trades].reverse().map((t) => (
            <tr key={t.id} className="border-b border-slate-800/60 last:border-0">
              <td className="py-2 pr-4 font-mono text-xs">{new Date(t.timestamp).toLocaleString('es')}</td>
              <td className="py-2 pr-4">
                <span
                  className={
                    t.side === 'buy'
                      ? 'rounded bg-emerald-950/60 px-2 py-0.5 text-xs text-emerald-300'
                      : 'rounded bg-red-950/60 px-2 py-0.5 text-xs text-red-300'
                  }
                >
                  {t.side === 'buy' ? 'Compra' : 'Venta'}
                </span>
              </td>
              <td className="py-2 pr-4 font-mono">${t.price.toFixed(2)}</td>
              <td className="py-2 pr-4 font-mono">{t.quantity.toFixed(6)}</td>
              <td className="py-2 pr-4 font-mono">${t.commission.toFixed(4)}</td>
              <td className="py-2 font-mono">
                {t.pnl_pct === null ? (
                  'N/D'
                ) : (
                  <span className={t.pnl_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {t.pnl_pct >= 0 ? '+' : ''}
                    {t.pnl_pct.toFixed(2)}%
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
