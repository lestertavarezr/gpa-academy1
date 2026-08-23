'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { PaperBotEquityPoint } from '@/lib/api';

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleString('es', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function BotEquityChart({ data }: { data: PaperBotEquityPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-400">Todavía no hay evaluaciones registradas para este bot.</p>;
  }

  const chartData = data.map((p) => ({ ...p, ts: new Date(p.timestamp).getTime() }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="ts" tickFormatter={formatTime} stroke="#64748b" tick={{ fontSize: 12 }} minTickGap={40} />
          <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
          <Tooltip
            labelFormatter={(value) => formatTime(new Date(Number(value)).toISOString())}
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: 12 }}
          />
          <Line type="monotone" dataKey="equity" name="Equity virtual" stroke="#38bdf8" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
