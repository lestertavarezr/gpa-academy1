from typing import Optional

import pandas as pd


def compute_rsi(closes: pd.Series, period: int = 14) -> Optional[float]:
    if len(closes) < period + 1:
        return None

    delta = closes.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))

    last_value = rsi.iloc[-1]
    return float(last_value) if pd.notna(last_value) else None


def compute_sma(closes: pd.Series, window: int) -> Optional[float]:
    if len(closes) < window:
        return None

    last_value = closes.rolling(window=window).mean().iloc[-1]
    return float(last_value) if pd.notna(last_value) else None
