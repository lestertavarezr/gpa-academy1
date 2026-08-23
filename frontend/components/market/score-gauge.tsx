'use client';

import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';

type Bias = 'bullish' | 'bearish' | 'neutral';

const BIAS_COLOR: Record<Bias, string> = {
  bullish: '#22c55e',
  bearish: '#ef4444',
  neutral: '#eab308',
};

const BIAS_LABEL: Record<Bias, string> = {
  bullish: 'Sesgo alcista',
  bearish: 'Sesgo bajista',
  neutral: 'Neutral',
};

export function ScoreGauge({ score, bias }: { score: number; bias: Bias }) {
  const color = BIAS_COLOR[bias];
  const data = [{ value: score, fill: color }];

  return (
    <div className="flex flex-col items-center">
      <RadialBarChart
        width={220}
        height={130}
        cx="50%"
        cy="100%"
        innerRadius="70%"
        outerRadius="100%"
        barSize={18}
        data={data}
        startAngle={180}
        endAngle={0}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar background dataKey="value" cornerRadius={9} angleAxisId={0} isAnimationActive={false} />
      </RadialBarChart>
      <div className="flex flex-col items-center">
        <span className="text-4xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-sm text-slate-400">{BIAS_LABEL[bias]}</span>
      </div>
    </div>
  );
}
