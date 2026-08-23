from typing import Dict, List, Literal, Optional

from pydantic import BaseModel

DISCLAIMER = (
    "Esto es un indicador tecnico, no una recomendacion de inversion. "
    "Los indicadores tecnicos no garantizan resultados futuros."
)


class Contribution(BaseModel):
    factor: str
    direction: Literal["bullish", "bearish"]
    points: int
    rationale: str
    indicators_used: Dict[str, Optional[float]]


class IndicatorSnapshot(BaseModel):
    price: Optional[float]
    rsi_14: Optional[float]
    macd_line: Optional[float]
    macd_signal: Optional[float]
    macd_histogram: Optional[float]
    sma_20: Optional[float]
    sma_50: Optional[float]
    sma_200: Optional[float]
    ema_20: Optional[float]
    ema_50: Optional[float]
    ema_200: Optional[float]
    bollinger_upper: Optional[float]
    bollinger_middle: Optional[float]
    bollinger_lower: Optional[float]
    relative_volume_30d: Optional[float]


class SignalSnapshot(BaseModel):
    """Resultado puro del calculo de indicadores + score para un DataFrame dado.

    No incluye symbol/timestamp/price_history: eso es responsabilidad de quien
    la use (endpoint en vivo o backtester), para poder reutilizar el mismo
    calculo en ambos contextos sin duplicar logica.
    """

    score: int
    bias: Literal["bullish", "bearish", "neutral"]
    indicators: IndicatorSnapshot
    contributions: List[Contribution]


class PricePoint(BaseModel):
    timestamp: int
    close: float
    sma_20: Optional[float]
    sma_50: Optional[float]
    sma_200: Optional[float]


class SignalResponse(BaseModel):
    symbol: str
    score: int
    bias: Literal["bullish", "bearish", "neutral"]
    indicators: IndicatorSnapshot
    contributions: List[Contribution]
    price_history: List[PricePoint]
    disclaimer: str
    generated_at: str
