import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getBtcUsdtMarketData } from '@/lib/api';

function formatNumber(value: number | null | undefined, digits = 2) {
  return value === null || value === undefined ? 'N/D' : value.toFixed(digits);
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-800 pb-2 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

export default async function DashboardPage() {
  let data;
  let error: string | null = null;

  try {
    data = await getBtcUsdtMarketData();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error desconocido';
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>BTC/USDT — Binance Testnet</CardTitle>
          <CardDescription>Fase 1: solo lectura de datos de mercado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            <>
              <Row label="Precio" value={data?.price ? `$${formatNumber(data.price)}` : 'N/D'} />
              <Row label="RSI (90d)" value={formatNumber(data?.rsi_14)} />
              <Row label="SMA 20" value={formatNumber(data?.sma_20)} />
              <Row label="SMA 50" value={formatNumber(data?.sma_50)} />
              <Row label="SMA 200" value={formatNumber(data?.sma_200)} />
              <p className="pt-4 text-xs text-slate-500">{data?.disclaimer}</p>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
