'use client';

import { useState } from 'react';

import { SUPPORTED_CCXT_SYMBOLS, type CreatePaperBotPayload, type SupportedCcxtSymbol } from '@/lib/api';

export function CreateBotForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (payload: CreatePaperBotPayload) => void;
}) {
  const [symbol, setSymbol] = useState<SupportedCcxtSymbol>('BTC/USDT');
  const [buyThreshold, setBuyThreshold] = useState(70);
  const [sellThreshold, setSellThreshold] = useState(30);
  const [initialCapital, setInitialCapital] = useState(1000);
  const [killSwitchPct, setKillSwitchPct] = useState(20);
  const [intervalMinutes, setIntervalMinutes] = useState(15);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      symbol,
      buy_score_threshold: buyThreshold,
      sell_score_threshold: sellThreshold,
      initial_capital: initialCapital,
      kill_switch_pct: killSwitchPct,
      evaluation_interval_minutes: intervalMinutes,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
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
        <span className="text-slate-400">Capital virtual (USDT)</span>
        <input
          type="number"
          min={1}
          value={initialCapital}
          onChange={(e) => setInitialCapital(Number(e.target.value))}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-400">Intervalo de evaluación (min)</span>
        <input
          type="number"
          min={1}
          max={1440}
          value={intervalMinutes}
          onChange={(e) => setIntervalMinutes(Number(e.target.value))}
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

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-400">Kill switch (% drawdown)</span>
        <input
          type="number"
          min={1}
          max={100}
          value={killSwitchPct}
          onChange={(e) => setKillSwitchPct(Number(e.target.value))}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
        />
      </label>

      <div className="sm:col-span-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear bot (paper trading)'}
        </button>
      </div>
    </form>
  );
}
