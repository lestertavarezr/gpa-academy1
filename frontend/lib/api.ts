export const SUPPORTED_SYMBOLS = ['BTC-USDT', 'ETH-USDT', 'SOL-USDT'] as const;
export type SupportedSymbol = (typeof SUPPORTED_SYMBOLS)[number];

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

export interface Contribution {
  factor: string;
  direction: 'bullish' | 'bearish';
  points: number;
  rationale: string;
  indicators_used: Record<string, number | null>;
}

export interface IndicatorSnapshot {
  price: number | null;
  rsi_14: number | null;
  macd_line: number | null;
  macd_signal: number | null;
  macd_histogram: number | null;
  sma_20: number | null;
  sma_50: number | null;
  sma_200: number | null;
  ema_20: number | null;
  ema_50: number | null;
  ema_200: number | null;
  bollinger_upper: number | null;
  bollinger_middle: number | null;
  bollinger_lower: number | null;
  relative_volume_30d: number | null;
}

export interface PricePoint {
  timestamp: number;
  close: number;
  sma_20: number | null;
  sma_50: number | null;
  sma_200: number | null;
}

export interface SignalResponse {
  symbol: string;
  score: number;
  bias: 'bullish' | 'bearish' | 'neutral';
  indicators: IndicatorSnapshot;
  contributions: Contribution[];
  price_history: PricePoint[];
  disclaimer: string;
  generated_at: string;
  cached: boolean;
}

function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';
}

export async function getMarketData(symbol: SupportedSymbol): Promise<MarketDataResponse> {
  const response = await fetch(`${getBackendUrl()}/market-data/${symbol}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener la informacion de mercado');
  }

  return response.json();
}

export async function getMarketSignal(symbol: SupportedSymbol): Promise<SignalResponse> {
  const response = await fetch(`${getBackendUrl()}/signals/${symbol}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('No se pudo generar el analisis de mercado');
  }

  return response.json();
}
