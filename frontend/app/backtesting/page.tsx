'use client';

import { useState } from 'react';

import { BacktestForm } from '@/components/backtest/backtest-form';
import { EquityChart } from '@/components/backtest/equity-chart';
import { MetricsTable } from '@/components/backtest/metrics-table';
import { UnderperformanceWarning } from '@/components/backtest/underperformance-warning';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DisclaimerBanner } from '@/components/market/disclaimer-banner';
import { runBacktest, type BacktestRequestPayload, type BacktestResponse } from '@/lib/api';

const DEFAULT_DISCLAIMER =
  'El rendimiento pasado no garantiza resultados futuros. Estos resultados no incluyen todos los costos reales de operar (ej. impuestos, latencia de red).';

export default function BacktestingPage() {
  const [result, setResult] = useState<BacktestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(payload: BacktestRequestPayload) {
    setLoading(true);
    setError(null);
    try {
      const data = await runBacktest(payload);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold">Backtesting</h1>
        <p className="text-sm text-slate-400">
          Simula cómo se hubiera comportado la estrategia de señales contra datos históricos, antes
          de considerar cualquier ejecución en real. Solo simulación — no ejecuta órdenes.
        </p>
      </div>

      <DisclaimerBanner text={DEFAULT_DISCLAIMER} />

      <Card>
        <CardHeader>
          <CardTitle>Configurar estrategia</CardTitle>
        </CardHeader>
        <CardContent>
          <BacktestForm loading={loading} onSubmit={handleSubmit} />
        </CardContent>
      </Card>

      {error && <p className="text-red-400">{error}</p>}

      {result && (
        <>
          {result.underperformed_buy_hold && <UnderperformanceWarning />}

          <Card>
            <CardHeader>
              <CardTitle>Equity: estrategia vs. buy &amp; hold</CardTitle>
            </CardHeader>
            <CardContent>
              <EquityChart data={result.equity_curve} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métricas</CardTitle>
            </CardHeader>
            <CardContent>
              <MetricsTable metrics={result.metrics} />
              <p className="mt-3 text-xs text-slate-500">
                Comisión simulada: {(result.commission_rate * 100).toFixed(2)}% · Slippage simulado:{' '}
                {(result.slippage_rate * 100).toFixed(2)}% por operación
              </p>
            </CardContent>
          </Card>

          <DisclaimerBanner text={result.disclaimer} />
        </>
      )}
    </main>
  );
}
