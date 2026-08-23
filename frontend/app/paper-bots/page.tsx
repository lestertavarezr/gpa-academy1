'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { BotCard } from '@/components/paper-bots/bot-card';
import { BotEquityChart } from '@/components/paper-bots/bot-equity-chart';
import { CreateBotForm } from '@/components/paper-bots/create-bot-form';
import { SimulatedBadge } from '@/components/paper-bots/simulated-badge';
import { TradeLogTable } from '@/components/paper-bots/trade-log-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DisclaimerBanner } from '@/components/market/disclaimer-banner';
import {
  createPaperBot,
  deletePaperBot,
  getPaperBot,
  listPaperBots,
  pausePaperBot,
  type CreatePaperBotPayload,
  type PaperBot,
  type PaperBotDetail,
} from '@/lib/api';

export default function PaperBotsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const token = session?.backendAccessToken;

  const [bots, setBots] = useState<PaperBot[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<PaperBotDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const refreshList = useCallback(async () => {
    if (!token) return;
    setLoadingList(true);
    try {
      const data = await listPaperBots(token);
      setBots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoadingList(false);
    }
  }, [token]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  useEffect(() => {
    if (selectedId === null || !token) {
      setDetail(null);
      return;
    }
    setLoadingDetail(true);
    getPaperBot(selectedId, token)
      .then(setDetail)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error desconocido'))
      .finally(() => setLoadingDetail(false));
  }, [selectedId, token]);

  async function handleCreate(payload: CreatePaperBotPayload) {
    if (!token) return;
    setCreating(true);
    setError(null);
    try {
      await createPaperBot(payload, token);
      await refreshList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setCreating(false);
    }
  }

  async function handlePause(id: number) {
    if (!token) return;
    try {
      await pausePaperBot(id, token);
      await refreshList();
      if (selectedId === id) {
        setDetail(await getPaperBot(id, token));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    try {
      await deletePaperBot(id, token);
      if (selectedId === id) {
        setSelectedId(null);
      }
      await refreshList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-slate-400">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mis Bots (Paper Trading)</h1>
          <p className="text-sm text-slate-400">
            Bots que operan con precios en vivo aplicando las reglas de la estrategia, pero con un
            portfolio virtual — nunca se ejecutan órdenes reales.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span>{session?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium hover:bg-slate-700"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SimulatedBadge />
      </div>

      <DisclaimerBanner text="Todo el capital y las operaciones de esta vista son simulados. Ningún bot aquí puede mover dinero real ni conectarse a una cuenta de exchange real." />

      <Card>
        <CardHeader>
          <CardTitle>Crear nuevo bot</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateBotForm loading={creating} onSubmit={handleCreate} />
        </CardContent>
      </Card>

      {error && <p className="text-red-400">{error}</p>}

      <div>
        <h2 className="mb-3 text-lg font-semibold">Bots activos</h2>
        {loadingList ? (
          <p className="text-slate-400">Cargando bots...</p>
        ) : bots.length === 0 ? (
          <p className="text-slate-400">Todavía no creaste ningún bot.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {bots.map((bot) => (
              <BotCard
                key={bot.id}
                bot={bot}
                selected={bot.id === selectedId}
                onSelect={() => setSelectedId(bot.id)}
                onPause={() => handlePause(bot.id)}
                onDelete={() => handleDelete(bot.id)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedId !== null && (
        <>
          {loadingDetail && <p className="text-slate-400">Cargando detalle...</p>}
          {detail && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>
                    Evolución del portfolio — {detail.symbol} (#{detail.id})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BotEquityChart data={detail.equity_curve} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Log de operaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <TradeLogTable trades={detail.trades} />
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </main>
  );
}
