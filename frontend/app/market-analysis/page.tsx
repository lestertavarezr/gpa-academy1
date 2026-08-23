'use client';

import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContributionsList } from '@/components/market/contributions-list';
import { DisclaimerBanner } from '@/components/market/disclaimer-banner';
import { PriceChart } from '@/components/market/price-chart';
import { ScoreGauge } from '@/components/market/score-gauge';
import { getMarketSignal, SUPPORTED_SYMBOLS, type SignalResponse, type SupportedSymbol } from '@/lib/api';

export default function MarketAnalysisPage() {
  const [symbol, setSymbol] = useState<SupportedSymbol>('BTC-USDT');
  const [signal, setSignal] = useState<SignalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getMarketSignal(symbol)
      .then((data) => {
        if (!cancelled) setSignal(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error desconocido');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold">Análisis de Mercado</h1>
        <p className="text-sm text-slate-400">
          Señal técnica compuesta por RSI, MACD, Bandas de Bollinger, medias móviles y volumen
          relativo. Solo lectura — no ejecuta órdenes.
        </p>
      </div>

      <DisclaimerBanner
        text={
          signal?.disclaimer ??
          'Esto es un indicador tecnico, no una recomendacion de inversion. Los indicadores tecnicos no garantizan resultados futuros.'
        }
      />

      <div className="flex gap-2">
        {SUPPORTED_SYMBOLS.map((s) => (
          <button
            key={s}
            onClick={() => setSymbol(s)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              s === symbol
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {s.replace('-', '/')}
          </button>
        ))}
      </div>

      {loading && <p className="text-slate-400">Calculando señal...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && signal && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Score de la señal</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-2">
                <ScoreGauge score={signal.score} bias={signal.bias} />
                <p className="text-xs text-slate-500">
                  {signal.cached ? 'Resultado servido desde cache' : 'Resultado recien calculado'} ·{' '}
                  {new Date(signal.generated_at).toLocaleString('es')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicadores actuales</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <IndicatorValue label="Precio" value={signal.indicators.price} />
                <IndicatorValue label="RSI 14" value={signal.indicators.rsi_14} />
                <IndicatorValue label="MACD hist." value={signal.indicators.macd_histogram} digits={4} />
                <IndicatorValue label="Vol. relativo" value={signal.indicators.relative_volume_30d} suffix="x" />
                <IndicatorValue label="SMA 20" value={signal.indicators.sma_20} />
                <IndicatorValue label="SMA 50" value={signal.indicators.sma_50} />
                <IndicatorValue label="SMA 200" value={signal.indicators.sma_200} />
                <IndicatorValue label="Bollinger sup." value={signal.indicators.bollinger_upper} />
                <IndicatorValue label="Bollinger inf." value={signal.indicators.bollinger_lower} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Precio con medias móviles</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceChart data={signal.price_history} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Por qué este score</CardTitle>
            </CardHeader>
            <CardContent>
              <ContributionsList contributions={signal.contributions} />
            </CardContent>
          </Card>

          <DisclaimerBanner text={signal.disclaimer} />
        </>
      )}
    </main>
  );
}

function IndicatorValue({
  label,
  value,
  digits = 2,
  suffix = '',
}: {
  label: string;
  value: number | null;
  digits?: number;
  suffix?: string;
}) {
  return (
    <div className="flex justify-between border-b border-slate-800 pb-1">
      <span className="text-slate-400">{label}</span>
      <span className="font-mono">{value === null ? 'N/D' : `${value.toFixed(digits)}${suffix}`}</span>
    </div>
  );
}
