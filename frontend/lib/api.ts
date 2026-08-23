export const SUPPORTED_SYMBOLS = ['BTC-USDT', 'ETH-USDT', 'SOL-USDT'] as const;
export type SupportedSymbol = (typeof SUPPORTED_SYMBOLS)[number];

export const SUPPORTED_CCXT_SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'] as const;
export type SupportedCcxtSymbol = (typeof SUPPORTED_CCXT_SYMBOLS)[number];

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

export interface BacktestRequestPayload {
  symbol: SupportedCcxtSymbol;
  start_date: string;
  end_date: string;
  buy_score_threshold: number;
  sell_score_threshold: number;
  initial_capital: number;
}

export interface TradeRecord {
  entry_date: string;
  entry_price: number;
  exit_date: string | null;
  exit_price: number | null;
  pnl_pct: number | null;
}

export interface BacktestEquityPoint {
  timestamp: number;
  strategy_equity: number;
  buy_hold_equity: number;
}

export interface BacktestMetrics {
  strategy_total_return_pct: number;
  buy_hold_total_return_pct: number;
  max_drawdown_pct: number;
  win_rate_pct: number | null;
  sharpe_ratio: number | null;
  total_trades: number;
}

export interface BacktestResponse {
  symbol: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  buy_score_threshold: number;
  sell_score_threshold: number;
  commission_rate: number;
  slippage_rate: number;
  metrics: BacktestMetrics;
  equity_curve: BacktestEquityPoint[];
  trades: TradeRecord[];
  underperformed_buy_hold: boolean;
  disclaimer: string;
  generated_at: string;
}

export async function runBacktest(payload: BacktestRequestPayload): Promise<BacktestResponse> {
  const response = await fetch(`${getBackendUrl()}/backtest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? 'No se pudo ejecutar el backtest');
  }

  return response.json();
}

export type PaperBotStatus = 'active' | 'paused' | 'stopped_kill_switch';

export interface CreatePaperBotPayload {
  symbol: SupportedCcxtSymbol;
  buy_score_threshold: number;
  sell_score_threshold: number;
  initial_capital: number;
  kill_switch_pct: number;
  evaluation_interval_minutes: number;
}

export interface PaperBot {
  id: number;
  user_id: string;
  symbol: string;
  buy_score_threshold: number;
  sell_score_threshold: number;
  initial_capital: number;
  cash: number;
  units_held: number;
  current_equity: number;
  pnl_pct: number;
  kill_switch_pct: number;
  evaluation_interval_minutes: number;
  status: PaperBotStatus;
  created_at: string;
  last_evaluated_at: string | null;
  disclaimer: string;
}

export interface PaperTrade {
  id: number;
  side: 'buy' | 'sell';
  timestamp: string;
  price: number;
  quantity: number;
  commission: number;
  pnl_pct: number | null;
  equity_after: number;
}

export interface PaperBotEvent {
  id: number;
  event_type: string;
  message: string;
  created_at: string;
}

export interface PaperBotEquityPoint {
  timestamp: string;
  equity: number;
  price: number;
}

export interface PaperBotDetail extends PaperBot {
  trades: PaperTrade[];
  events: PaperBotEvent[];
  equity_curve: PaperBotEquityPoint[];
}

async function handleJsonResponse<T>(response: Response, fallbackError: string): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? fallbackError);
  }
  return response.json();
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export async function createPaperBot(payload: CreatePaperBotPayload, token: string): Promise<PaperBot> {
  const response = await fetch(`${getBackendUrl()}/paper-bots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  return handleJsonResponse(response, 'No se pudo crear el bot');
}

export async function listPaperBots(token: string): Promise<PaperBot[]> {
  const response = await fetch(`${getBackendUrl()}/paper-bots`, {
    headers: authHeaders(token),
    cache: 'no-store',
  });
  return handleJsonResponse(response, 'No se pudieron obtener los bots');
}

export async function getPaperBot(id: number, token: string): Promise<PaperBotDetail> {
  const response = await fetch(`${getBackendUrl()}/paper-bots/${id}`, {
    headers: authHeaders(token),
    cache: 'no-store',
  });
  return handleJsonResponse(response, 'No se pudo obtener el bot');
}

export async function pausePaperBot(id: number, token: string): Promise<PaperBot> {
  const response = await fetch(`${getBackendUrl()}/paper-bots/${id}/pause`, {
    method: 'PATCH',
    headers: authHeaders(token),
    cache: 'no-store',
  });
  return handleJsonResponse(response, 'No se pudo pausar el bot');
}

export async function deletePaperBot(id: number, token: string): Promise<void> {
  const response = await fetch(`${getBackendUrl()}/paper-bots/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
    cache: 'no-store',
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? 'No se pudo eliminar el bot');
  }
}

export interface RegisterResponse {
  userId: number;
  qrCodeDataUrl: string;
  manualEntryCode: string;
}

export async function registerUser(email: string, password: string): Promise<RegisterResponse> {
  const response = await fetch(`${getBackendUrl()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });
  return handleJsonResponse(response, 'No se pudo registrar la cuenta');
}

export async function verify2faSetup(userId: number, code: string): Promise<{ success: true }> {
  const response = await fetch(`${getBackendUrl()}/auth/2fa/verify-setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, code }),
    cache: 'no-store',
  });
  return handleJsonResponse(response, 'No se pudo verificar el codigo');
}
