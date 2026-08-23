from datetime import datetime, timezone

import pandas as pd

from app.indicators import (
    compute_bollinger_bands,
    compute_ema,
    compute_macd,
    compute_relative_volume,
    compute_rsi,
    compute_sma,
    compute_sma_series,
)
from app.market_data import fetch_ohlcv_df
from app.signals.schemas import DISCLAIMER, IndicatorSnapshot, PricePoint, SignalResponse
from app.signals.scoring import (
    IndicatorInputs,
    classify_bias,
    evaluate_rules,
    score_from_contributions,
)

RSI_WINDOW_DAYS = 90
PRICE_HISTORY_POINTS = 120


def build_signal(ccxt_symbol: str) -> SignalResponse:
    df, ticker = fetch_ohlcv_df(ccxt_symbol)
    closes = df["close"]
    volumes = df["volume"]
    price = ticker.get("last")

    rsi_14 = compute_rsi(closes.tail(RSI_WINDOW_DAYS))
    sma_20 = compute_sma(closes, 20)
    sma_50 = compute_sma(closes, 50)
    sma_200 = compute_sma(closes, 200)
    ema_20 = compute_ema(closes, 20)
    ema_50 = compute_ema(closes, 50)
    ema_200 = compute_ema(closes, 200)
    bollinger = compute_bollinger_bands(closes)
    relative_volume = compute_relative_volume(volumes)

    macd_result = compute_macd(closes)
    macd_line = macd_signal = macd_histogram = macd_histogram_prev = None
    if macd_result is not None:
        macd_line = float(macd_result.macd_line.iloc[-1])
        macd_signal = float(macd_result.signal_line.iloc[-1])
        macd_histogram = float(macd_result.histogram.iloc[-1])
        if len(macd_result.histogram) >= 2:
            macd_histogram_prev = float(macd_result.histogram.iloc[-2])

    indicator_inputs: IndicatorInputs = {
        "price": price,
        "rsi_14": rsi_14,
        "macd_histogram": macd_histogram,
        "macd_histogram_prev": macd_histogram_prev,
        "sma_50": sma_50,
        "sma_200": sma_200,
        "ema_20": ema_20,
        "ema_50": ema_50,
        "bollinger_upper": bollinger.upper if bollinger else None,
        "bollinger_lower": bollinger.lower if bollinger else None,
        "relative_volume_30d": relative_volume,
    }

    contributions = evaluate_rules(indicator_inputs)
    score = score_from_contributions(contributions)
    bias = classify_bias(score)

    indicators = IndicatorSnapshot(
        price=_round_or_none(price),
        rsi_14=_round_or_none(rsi_14),
        macd_line=_round_or_none(macd_line, 4),
        macd_signal=_round_or_none(macd_signal, 4),
        macd_histogram=_round_or_none(macd_histogram, 4),
        sma_20=_round_or_none(sma_20),
        sma_50=_round_or_none(sma_50),
        sma_200=_round_or_none(sma_200),
        ema_20=_round_or_none(ema_20),
        ema_50=_round_or_none(ema_50),
        ema_200=_round_or_none(ema_200),
        bollinger_upper=_round_or_none(bollinger.upper if bollinger else None),
        bollinger_middle=_round_or_none(bollinger.middle if bollinger else None),
        bollinger_lower=_round_or_none(bollinger.lower if bollinger else None),
        relative_volume_30d=_round_or_none(relative_volume),
    )

    price_history = _build_price_history(df, closes)

    return SignalResponse(
        symbol=ccxt_symbol,
        score=score,
        bias=bias,
        indicators=indicators,
        contributions=contributions,
        price_history=price_history,
        disclaimer=DISCLAIMER,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )


def _build_price_history(df, closes) -> list[PricePoint]:
    sma_20_series = compute_sma_series(closes, 20)
    sma_50_series = compute_sma_series(closes, 50)
    sma_200_series = compute_sma_series(closes, 200)

    tail = df.tail(PRICE_HISTORY_POINTS)
    points = []
    for idx in tail.index:
        points.append(
            PricePoint(
                timestamp=int(df.loc[idx, "timestamp"]),
                close=round(float(df.loc[idx, "close"]), 2),
                sma_20=_round_or_none(sma_20_series.loc[idx]),
                sma_50=_round_or_none(sma_50_series.loc[idx]),
                sma_200=_round_or_none(sma_200_series.loc[idx]),
            )
        )
    return points


def _round_or_none(value, digits: int = 2):
    if value is None or pd.isna(value):
        return None
    return round(float(value), digits)
