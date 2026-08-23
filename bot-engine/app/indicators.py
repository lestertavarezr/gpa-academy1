from typing import NamedTuple, Optional

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


def compute_sma_series(closes: pd.Series, window: int) -> pd.Series:
    return closes.rolling(window=window).mean()


def compute_ema(closes: pd.Series, window: int) -> Optional[float]:
    if len(closes) < window:
        return None

    last_value = closes.ewm(span=window, adjust=False).mean().iloc[-1]
    return float(last_value) if pd.notna(last_value) else None


class MacdResult(NamedTuple):
    macd_line: pd.Series
    signal_line: pd.Series
    histogram: pd.Series


def compute_macd(
    closes: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9
) -> Optional[MacdResult]:
    if len(closes) < slow + signal:
        return None

    ema_fast = closes.ewm(span=fast, adjust=False).mean()
    ema_slow = closes.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line

    return MacdResult(macd_line=macd_line, signal_line=signal_line, histogram=histogram)


class BollingerBands(NamedTuple):
    upper: float
    middle: float
    lower: float


def compute_bollinger_bands(
    closes: pd.Series, window: int = 20, num_std: float = 2.0
) -> Optional[BollingerBands]:
    if len(closes) < window:
        return None

    rolling = closes.rolling(window=window)
    middle = rolling.mean().iloc[-1]
    std = rolling.std().iloc[-1]

    if pd.isna(middle) or pd.isna(std):
        return None

    return BollingerBands(
        upper=float(middle + num_std * std),
        middle=float(middle),
        lower=float(middle - num_std * std),
    )


def compute_relative_volume(volumes: pd.Series, window: int = 30) -> Optional[float]:
    """Relacion entre el volumen mas reciente y el promedio de las 'window' velas previas."""
    if len(volumes) < window + 1:
        return None

    last_volume = volumes.iloc[-1]
    avg_volume = volumes.iloc[-(window + 1) : -1].mean()

    if pd.isna(avg_volume) or avg_volume == 0:
        return None

    return float(last_volume / avg_volume)
