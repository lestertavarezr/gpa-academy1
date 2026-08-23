'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { PricePoint } from '@/lib/api';

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('es', { month: 'short', day: 'numeric' });
}

export function PriceChart({ data }: { data: PricePoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatDate}
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            minTickGap={30}
          />
          <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
          <Tooltip
            labelFormatter={(value) => formatDate(Number(value))}
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: 12 }}
          />
          <Line type="monotone" dataKey="close" name="Precio" stroke="#e2e8f0" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="sma_20" name="SMA 20" stroke="#38bdf8" dot={false} strokeWidth={1.5} />
          <Line type="monotone" dataKey="sma_50" name="SMA 50" stroke="#a78bfa" dot={false} strokeWidth={1.5} />
          <Line type="monotone" dataKey="sma_200" name="SMA 200" stroke="#f472b6" dot={false} strokeWidth={1.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
