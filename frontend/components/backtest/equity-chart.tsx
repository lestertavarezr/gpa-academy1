'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { BacktestEquityPoint } from '@/lib/api';

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('es', { year: '2-digit', month: 'short', day: 'numeric' });
}

export function EquityChart({ data }: { data: BacktestEquityPoint[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatDate}
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            minTickGap={40}
          />
          <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
          <Tooltip
            labelFormatter={(value) => formatDate(Number(value))}
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: 12 }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="strategy_equity"
            name="Estrategia"
            stroke="#38bdf8"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="buy_hold_equity"
            name="Buy & Hold"
            stroke="#94a3b8"
            dot={false}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
