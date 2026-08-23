export interface MarketDataResponse {
  symbol: string;
  price: number | null;
  rsi_14: number | null;
  sma_20: number | null;
  sma_50: number | null;
  sma_200: number | null;
  historical_days_used: number;
  source: string;
  timestamp: string;
  disclaimer: string;
}

export async function getBtcUsdtMarketData(): Promise<MarketDataResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';

  const response = await fetch(`${backendUrl}/market-data/btc-usdt`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener la informacion de mercado');
  }

  return response.json();
}
