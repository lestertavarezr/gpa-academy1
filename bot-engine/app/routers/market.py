from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter

from app.indicators import compute_rsi, compute_sma
from app.market_data import fetch_ohlcv_df
from app.symbols import resolve_symbol

router = APIRouter(prefix="/market", tags=["market"])

RSI_WINDOW_DAYS = 90


@router.get("/{symbol}")
def get_market_data(symbol: str):
    ccxt_symbol = resolve_symbol(symbol)
    df, ticker = fetch_ohlcv_df(ccxt_symbol)

    closes = df["close"]
    rsi_closes = closes.tail(RSI_WINDOW_DAYS)

    return {
        "symbol": ccxt_symbol,
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
