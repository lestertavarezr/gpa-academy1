from typing import Tuple

import pandas as pd
from fastapi import HTTPException

from app.exchange import get_exchange

# 250 velas diarias dan margen suficiente para calcular una SMA/EMA 200.
HISTORY_LIMIT = 250


def fetch_ohlcv_df(ccxt_symbol: str, limit: int = HISTORY_LIMIT) -> Tuple[pd.DataFrame, dict]:
    """Trae ticker + velas diarias de Binance testnet para un simbolo ya resuelto (formato 'BTC/USDT').

    Devuelve (dataframe_ohlcv, ticker) para que los distintos consumidores
    (endpoint de mercado, motor de senales) no dupliquen la llamada a ccxt.
    """
    exchange = get_exchange()

    try:
        ticker = exchange.fetch_ticker(ccxt_symbol)
        ohlcv = exchange.fetch_ohlcv(ccxt_symbol, timeframe="1d", limit=limit)
    except Exception as exc:  # ccxt puede lanzar varios tipos de excepcion de red/exchange
        raise HTTPException(
            status_code=502,
            detail=f"Error al consultar Binance testnet: {exc}",
        ) from exc

    if not ohlcv:
        raise HTTPException(status_code=502, detail="Binance testnet no devolvio datos historicos")

    df = pd.DataFrame(ohlcv, columns=["timestamp", "open", "high", "low", "close", "volume"])
    return df, ticker
