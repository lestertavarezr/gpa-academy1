from datetime import datetime, timezone
from typing import Optional

import pandas as pd
from fastapi import APIRouter, HTTPException

from app.config import settings
from app.exchange import get_exchange
from app.indicators import compute_rsi, compute_sma

router = APIRouter(prefix="/market", tags=["market"])

# Se piden 250 velas diarias para tener margen suficiente para la SMA 200,
# y luego se usan las ultimas 90 para el calculo del RSI solicitado.
HISTORY_LIMIT = 250
RSI_WINDOW_DAYS = 90


@router.get("/btc-usdt")
def get_btc_usdt():
    exchange = get_exchange()

    try:
        ticker = exchange.fetch_ticker(settings.symbol)
        ohlcv = exchange.fetch_ohlcv(settings.symbol, timeframe="1d", limit=HISTORY_LIMIT)
    except Exception as exc:  # ccxt puede lanzar varios tipos de excepcion de red/exchange
        raise HTTPException(
            status_code=502,
            detail=f"Error al consultar Binance testnet: {exc}",
        ) from exc

    if not ohlcv:
        raise HTTPException(status_code=502, detail="Binance testnet no devolvio datos historicos")

    df = pd.DataFrame(ohlcv, columns=["timestamp", "open", "high", "low", "close", "volume"])
    closes = df["close"]
    rsi_closes = closes.tail(RSI_WINDOW_DAYS)

    return {
        "symbol": settings.symbol,
        "price": ticker.get("last"),
        "rsi_14": _round_or_none(compute_rsi(rsi_closes)),
        "sma_20": _round_or_none(compute_sma(closes, 20)),
        "sma_50": _round_or_none(compute_sma(closes, 50)),
        "sma_200": _round_or_none(compute_sma(closes, 200)),
        "historical_days_used": len(closes),
        "source": "binance-testnet",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "disclaimer": (
            "Datos informativos generados sobre Binance Testnet. "
            "No constituyen asesoria financiera ni garantia de resultados."
        ),
    }


def _round_or_none(value: Optional[float]) -> Optional[float]:
    return round(value, 2) if value is not None else None
