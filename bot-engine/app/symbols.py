from fastapi import HTTPException

# Allowlist de activos soportados en esta fase. Mantenerla acotada evita
# pegarle a ccxt con pares arbitrarios no verificados desde la URL.
SUPPORTED_SYMBOLS = {
    "BTC-USDT": "BTC/USDT",
    "ETH-USDT": "ETH/USDT",
    "SOL-USDT": "SOL/USDT",
}


def resolve_symbol(path_symbol: str) -> str:
    """Convierte el simbolo de la URL (ej. 'BTC-USDT') al formato ccxt ('BTC/USDT')."""
    normalized = path_symbol.upper()
    ccxt_symbol = SUPPORTED_SYMBOLS.get(normalized)

    if ccxt_symbol is None:
        supported = ", ".join(SUPPORTED_SYMBOLS.keys())
        raise HTTPException(
            status_code=404,
            detail=f"Simbolo '{path_symbol}' no soportado. Disponibles: {supported}",
        )

    return ccxt_symbol
