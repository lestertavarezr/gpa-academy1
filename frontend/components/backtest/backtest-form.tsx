'use client';

import { useState } from 'react';

import { SUPPORTED_CCXT_SYMBOLS, type BacktestRequestPayload, type SupportedCcxtSymbol } from '@/lib/api';

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function defaultDates() {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 2);
  return { start: isoDate(start), end: isoDate(end) };
}

export function BacktestForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (payload: BacktestRequestPayload) => void;
}) {
  const { start, end } = defaultDates();

  const [symbol, setSymbol] = useState<SupportedCcxtSymbol>('BTC/USDT');
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);
  const [buyThreshold, setBuyThreshold] = useState(70);
  const [sellThreshold, setSellThreshold] = useState(30);
  const [initialCapital, setInitialCapital] = useState(10000);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      symbol,
      start_date: startDate,
      end_date: endDate,
      buy_score_threshold: buyThreshold,
      sell_score_threshold: sellThreshold,
      initial_capital: initialCapital,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-400">Activo</span>
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value as SupportedCcxtSymbol)}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
        >
          {SUPPORTED_CCXT_SYMBOLS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-400">Capital inicial (USDT)</span>
        <input
          type="number"
          min={1}
          value={initialCapital}
          onChange={(e) => setInitialCapital(Number(e.target.value))}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-400">Desde</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-400">Hasta</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-400">Comprar cuando score &gt;</span>
        <input
          type="number"
          min={0}
          max={100}
          value={buyThreshold}
          onChange={(e) => setBuyThreshold(Number(e.target.value))}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-400">Vender cuando score &lt;</span>
        <input
          type="number"
          min={0}
          max={100}
          value={sellThreshold}
          onChange={(e) => setSellThreshold(Number(e.target.value))}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
        />
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Simulando...' : 'Correr backtest'}
        </button>
      </div>
    </form>
  );
}
