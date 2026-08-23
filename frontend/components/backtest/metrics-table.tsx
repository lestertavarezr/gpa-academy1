import type { BacktestMetrics } from '@/lib/api';

function fmt(value: number | null, digits = 2, suffix = '') {
  return value === null ? 'N/D' : `${value.toFixed(digits)}${suffix}`;
}

export function MetricsTable({ metrics }: { metrics: BacktestMetrics }) {
  const rows: [string, string][] = [
    ['Retorno de la estrategia', fmt(metrics.strategy_total_return_pct, 2, '%')],
    ['Retorno buy & hold', fmt(metrics.buy_hold_total_return_pct, 2, '%')],
    ['Máximo drawdown', fmt(metrics.max_drawdown_pct, 2, '%')],
    ['Win rate', fmt(metrics.win_rate_pct, 1, '%')],
    ['Sharpe ratio', fmt(metrics.sharpe_ratio, 2)],
    ['Operaciones totales', String(metrics.total_trades)],
  ];

  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} className="border-b border-slate-800 last:border-0">
            <td className="py-2 text-slate-400">{label}</td>
            <td className="py-2 text-right font-mono">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
