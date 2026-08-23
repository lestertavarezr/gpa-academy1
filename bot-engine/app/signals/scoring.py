from typing import Callable, List, Optional, TypedDict

from app.signals.schemas import Contribution

NEUTRAL_SCORE = 50
BULLISH_THRESHOLD = 65
BEARISH_THRESHOLD = 35

RSI_OVERSOLD = 30
RSI_OVERBOUGHT = 70
RELATIVE_VOLUME_HIGH = 1.5


class IndicatorInputs(TypedDict):
    price: Optional[float]
    rsi_14: Optional[float]
    macd_histogram: Optional[float]
    macd_histogram_prev: Optional[float]
    sma_50: Optional[float]
    sma_200: Optional[float]
    ema_20: Optional[float]
    ema_50: Optional[float]
    bollinger_upper: Optional[float]
    bollinger_lower: Optional[float]
    relative_volume_30d: Optional[float]


def _macd_cross_direction(data: IndicatorInputs) -> Optional[str]:
    """Detecta si el histograma del MACD (macd - señal) cruzo el cero entre la vela anterior y la actual."""
    current = data["macd_histogram"]
    previous = data["macd_histogram_prev"]

    if current is None or previous is None:
        return None
    if previous < 0 and current > 0:
        return "bullish"
    if previous > 0 and current < 0:
        return "bearish"
    return None


def rule_rsi_extremes(data: IndicatorInputs) -> Optional[Contribution]:
    rsi = data["rsi_14"]
    if rsi is None:
        return None

    if rsi < RSI_OVERSOLD:
        return Contribution(
            factor="rsi_oversold",
            direction="bullish",
            points=15,
            rationale=f"RSI({round(rsi, 2)}) por debajo de {RSI_OVERSOLD}: zona de sobreventa.",
            indicators_used={"rsi_14": round(rsi, 2)},
        )
    if rsi > RSI_OVERBOUGHT:
        return Contribution(
            factor="rsi_overbought",
            direction="bearish",
            points=-15,
            rationale=f"RSI({round(rsi, 2)}) por encima de {RSI_OVERBOUGHT}: zona de sobrecompra.",
            indicators_used={"rsi_14": round(rsi, 2)},
        )
    return None


def rule_bollinger_touch(data: IndicatorInputs) -> Optional[Contribution]:
    price = data["price"]
    lower = data["bollinger_lower"]
    upper = data["bollinger_upper"]

    if price is None or lower is None or upper is None:
        return None

    if price <= lower:
        return Contribution(
            factor="bollinger_lower_touch",
            direction="bullish",
            points=10,
            rationale="El precio toca o perfora la banda inferior de Bollinger.",
            indicators_used={"price": round(price, 2), "bollinger_lower": round(lower, 2)},
        )
    if price >= upper:
        return Contribution(
            factor="bollinger_upper_touch",
            direction="bearish",
            points=-10,
            rationale="El precio toca o perfora la banda superior de Bollinger.",
            indicators_used={"price": round(price, 2), "bollinger_upper": round(upper, 2)},
        )
    return None


def rule_oversold_overbought_confluence(data: IndicatorInputs) -> Optional[Contribution]:
    """Bono cuando RSI extremo y toque de banda de Bollinger ocurren juntos (mayor confianza en la reversion)."""
    price = data["price"]
    rsi = data["rsi_14"]
    lower = data["bollinger_lower"]
    upper = data["bollinger_upper"]

    if price is None or rsi is None or lower is None or upper is None:
        return None

    if rsi < RSI_OVERSOLD and price <= lower:
        return Contribution(
            factor="oversold_confluence",
            direction="bullish",
            points=10,
            rationale="Confluencia de sobreventa: RSI bajo y precio en banda inferior de Bollinger a la vez.",
            indicators_used={"rsi_14": round(rsi, 2), "price": round(price, 2), "bollinger_lower": round(lower, 2)},
        )
    if rsi > RSI_OVERBOUGHT and price >= upper:
        return Contribution(
            factor="overbought_confluence",
            direction="bearish",
            points=-10,
            rationale="Confluencia de sobrecompra: RSI alto y precio en banda superior de Bollinger a la vez.",
            indicators_used={"rsi_14": round(rsi, 2), "price": round(price, 2), "bollinger_upper": round(upper, 2)},
        )
    return None


def rule_macd_cross(data: IndicatorInputs) -> Optional[Contribution]:
    direction = _macd_cross_direction(data)
    if direction is None:
        return None

    histogram = round(data["macd_histogram"], 4) if data["macd_histogram"] is not None else None

    if direction == "bullish":
        return Contribution(
            factor="macd_bullish_cross",
            direction="bullish",
            points=15,
            rationale="El histograma del MACD cruzo de negativo a positivo (cruce alcista de la linea MACD sobre la señal).",
            indicators_used={"macd_histogram": histogram},
        )
    return Contribution(
        factor="macd_bearish_cross",
        direction="bearish",
        points=-15,
        rationale="El histograma del MACD cruzo de positivo a negativo (cruce bajista de la linea MACD bajo la señal).",
        indicators_used={"macd_histogram": histogram},
    )


def rule_volume_momentum_confluence(data: IndicatorInputs) -> Optional[Contribution]:
    """Bono cuando un cruce de MACD viene acompañado de volumen relativo alto (mayor confianza en el momentum)."""
    direction = _macd_cross_direction(data)
    rel_volume = data["relative_volume_30d"]

    if direction is None or rel_volume is None or rel_volume < RELATIVE_VOLUME_HIGH:
        return None

    if direction == "bullish":
        return Contribution(
            factor="bullish_momentum_volume",
            direction="bullish",
            points=10,
            rationale=(
                f"Cruce alcista de MACD confirmado por volumen relativo alto "
                f"({round(rel_volume, 2)}x el promedio de 30 dias)."
            ),
            indicators_used={"relative_volume_30d": round(rel_volume, 2)},
        )
    return Contribution(
        factor="bearish_momentum_volume",
        direction="bearish",
        points=-10,
        rationale=(
            f"Cruce bajista de MACD confirmado por volumen relativo alto "
            f"({round(rel_volume, 2)}x el promedio de 30 dias)."
        ),
        indicators_used={"relative_volume_30d": round(rel_volume, 2)},
    )


def rule_trend_alignment(data: IndicatorInputs) -> Optional[Contribution]:
    price = data["price"]
    sma_50 = data["sma_50"]
    sma_200 = data["sma_200"]

    if price is None or sma_50 is None or sma_200 is None:
        return None

    if price > sma_50 > sma_200:
        return Contribution(
            factor="trend_alignment_bullish",
            direction="bullish",
            points=10,
            rationale="Tendencia alcista: precio > SMA50 > SMA200.",
            indicators_used={"price": round(price, 2), "sma_50": round(sma_50, 2), "sma_200": round(sma_200, 2)},
        )
    if price < sma_50 < sma_200:
        return Contribution(
            factor="trend_alignment_bearish",
            direction="bearish",
            points=-10,
            rationale="Tendencia bajista: precio < SMA50 < SMA200.",
            indicators_used={"price": round(price, 2), "sma_50": round(sma_50, 2), "sma_200": round(sma_200, 2)},
        )
    return None


def rule_ema_short_term_trend(data: IndicatorInputs) -> Optional[Contribution]:
    ema_20 = data["ema_20"]
    ema_50 = data["ema_50"]

    if ema_20 is None or ema_50 is None:
        return None

    if ema_20 > ema_50:
        return Contribution(
            factor="ema_short_term_bullish",
            direction="bullish",
            points=8,
            rationale="EMA20 por encima de EMA50: momentum de corto plazo alcista.",
            indicators_used={"ema_20": round(ema_20, 2), "ema_50": round(ema_50, 2)},
        )
    return Contribution(
        factor="ema_short_term_bearish",
        direction="bearish",
        points=-8,
        rationale="EMA20 por debajo de EMA50: momentum de corto plazo bajista.",
        indicators_used={"ema_20": round(ema_20, 2), "ema_50": round(ema_50, 2)},
    )


RULES: List[Callable[[IndicatorInputs], Optional[Contribution]]] = [
    rule_rsi_extremes,
    rule_bollinger_touch,
    rule_oversold_overbought_confluence,
    rule_macd_cross,
    rule_volume_momentum_confluence,
    rule_trend_alignment,
    rule_ema_short_term_trend,
]


def evaluate_rules(data: IndicatorInputs) -> List[Contribution]:
    contributions = []
    for rule in RULES:
        result = rule(data)
        if result is not None:
            contributions.append(result)
    return contributions


def score_from_contributions(contributions: List[Contribution]) -> int:
    total = NEUTRAL_SCORE + sum(c.points for c in contributions)
    return max(0, min(100, total))


def classify_bias(score: int) -> str:
    if score >= BULLISH_THRESHOLD:
        return "bullish"
    if score <= BEARISH_THRESHOLD:
        return "bearish"
    return "neutral"
