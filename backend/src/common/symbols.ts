export const SUPPORTED_SYMBOLS = ['BTC-USDT', 'ETH-USDT', 'SOL-USDT'] as const;

export type SupportedSymbol = (typeof SUPPORTED_SYMBOLS)[number];

export function isSupportedSymbol(symbol: string): symbol is SupportedSymbol {
  return (SUPPORTED_SYMBOLS as readonly string[]).includes(symbol.toUpperCase());
}

export function assertSupportedSymbol(symbol: string): SupportedSymbol {
  const normalized = symbol.toUpperCase();
  if (!isSupportedSymbol(normalized)) {
    throw new Error(
      `Simbolo '${symbol}' no soportado. Disponibles: ${SUPPORTED_SYMBOLS.join(', ')}`,
    );
  }
  return normalized as SupportedSymbol;
}

// Formato ccxt ("BTC/USDT"), usado en el body JSON de POST /backtest (a
// diferencia de las rutas GET, que usan el formato con guion de arriba).
export const SUPPORTED_CCXT_SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'] as const;

export type SupportedCcxtSymbol = (typeof SUPPORTED_CCXT_SYMBOLS)[number];

export function dashSymbolToCcxt(dashSymbol: string): SupportedCcxtSymbol | null {
  const normalized = dashSymbol.toUpperCase().replace('-', '/');
  return (SUPPORTED_CCXT_SYMBOLS as readonly string[]).includes(normalized)
    ? (normalized as SupportedCcxtSymbol)
    : null;
}
