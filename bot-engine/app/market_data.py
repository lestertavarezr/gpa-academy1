from datetime import datetime
from typing import Tuple

import pandas as pd
from fastapi import HTTPException

from app.exchange import get_exchange, get_public_exchange

# 250 velas diarias dan margen suficiente para calcular una SMA/EMA 200.
HISTORY_LIMIT = 250

# Binance devuelve como maximo 1000 velas por llamada; con este limite de
# paginas alcanza para decadas de historia diaria, mucho mas de lo que pide
# esta fase (2+ anios).
MAX_HISTORY_PAGES = 20
BINANCE_MAX_CANDLES_PER_CALL = 1000
ONE_DAY_MS = 24 * 60 * 60 * 1000


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


def fetch_historical_range(ccxt_symbol: str, since: datetime, until: datetime) -> pd.DataFrame:
    """Trae velas diarias historicas desde Binance MAINNET (solo lectura, sin keys) para backtesting.

    Se usa mainnet en vez de testnet porque testnet no conserva 2+ anios de
    historia. Este cliente (get_public_exchange) nunca tiene credenciales.
    Pagina con `since` porque Binance limita a 1000 velas por llamada.
    """
    exchange = get_public_exchange()
    since_ms = int(since.timestamp() * 1000)
    until_ms = int(until.timestamp() * 1000)

    candles = []
    cursor = since_ms

    for _ in range(MAX_HISTORY_PAGES):
        try:
            batch = exchange.fetch_ohlcv(
                ccxt_symbol, timeframe="1d", since=cursor, limit=BINANCE_MAX_CANDLES_PER_CALL
            )
        except Exception as exc:  # ccxt puede lanzar varios tipos de excepcion de red/exchange
            raise HTTPException(
                status_code=502,
                detail=f"Error al consultar historial de Binance: {exc}",
            ) from exc

        if not batch:
            break

        candles.extend(batch)
        last_timestamp = batch[-1][0]

        if last_timestamp >= until_ms or len(batch) < BINANCE_MAX_CANDLES_PER_CALL:
            break

        cursor = last_timestamp + ONE_DAY_MS  # avanzar para no volver a pedir la ultima vela ya obtenida

    if not candles:
        raise HTTPException(
            status_code=502,
            detail="No se encontro historial de Binance para el simbolo/rango solicitado",
        )

    df = pd.DataFrame(candles, columns=["timestamp", "open", "high", "low", "close", "volume"])
    df = df.drop_duplicates(subset="timestamp").sort_values("timestamp").reset_index(drop=True)
    df = df[(df["timestamp"] >= since_ms) & (df["timestamp"] <= until_ms)].reset_index(drop=True)
    return df
