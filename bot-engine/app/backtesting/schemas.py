from datetime import date, timedelta
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

BACKTEST_DISCLAIMER = (
    "El rendimiento pasado no garantiza resultados futuros. Esta simulacion "
    "no incluye todos los costos reales de operar (impuestos, latencia de "
    "red, rechazo parcial de ordenes, cambios en la liquidez del mercado)."
)

MAX_RANGE_DAYS = 5 * 365
MIN_RANGE_DAYS = 60


class BacktestRequest(BaseModel):
    symbol: str = Field(..., description="Formato ccxt, ej. 'BTC/USDT'")
    start_date: date
    end_date: date
    buy_score_threshold: int = Field(70, ge=0, le=100)
    sell_score_threshold: int = Field(30, ge=0, le=100)
    initial_capital: float = Field(10_000, gt=0)

    @field_validator("end_date")
    @classmethod
    def end_date_not_in_future(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("end_date no puede ser en el futuro")
        return value

    @model_validator(mode="after")
    def validate_range_and_thresholds(self) -> "BacktestRequest":
        if self.end_date <= self.start_date:
            raise ValueError("end_date debe ser posterior a start_date")

        range_days = (self.end_date - self.start_date).days
        if range_days < MIN_RANGE_DAYS:
            raise ValueError(f"El rango debe cubrir al menos {MIN_RANGE_DAYS} dias")
        if range_days > MAX_RANGE_DAYS:
            raise ValueError(f"El rango no puede superar {MAX_RANGE_DAYS} dias")

        if self.buy_score_threshold <= self.sell_score_threshold:
            raise ValueError("buy_score_threshold debe ser mayor que sell_score_threshold")

        return self


class TradeRecord(BaseModel):
    entry_date: str
    entry_price: float
    exit_date: Optional[str] = None
    exit_price: Optional[float] = None
    pnl_pct: Optional[float] = None


class EquityPoint(BaseModel):
    timestamp: int
    strategy_equity: float
    buy_hold_equity: float


class BacktestMetrics(BaseModel):
    strategy_total_return_pct: float
    buy_hold_total_return_pct: float
    max_drawdown_pct: float
    win_rate_pct: Optional[float]
    sharpe_ratio: Optional[float]
    total_trades: int


class BacktestResponse(BaseModel):
    symbol: str
    start_date: str
    end_date: str
    initial_capital: float
    buy_score_threshold: int
    sell_score_threshold: int
    commission_rate: float
    slippage_rate: float
    metrics: BacktestMetrics
    equity_curve: List[EquityPoint]
    trades: List[TradeRecord]
    underperformed_buy_hold: bool
    disclaimer: str
    generated_at: str
