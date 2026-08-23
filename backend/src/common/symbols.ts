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
