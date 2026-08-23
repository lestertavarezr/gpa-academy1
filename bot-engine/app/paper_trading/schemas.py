from typing import List, Optional

from pydantic import BaseModel, Field, model_validator

from app.paper_trading.models import BotStatus, TradeSide

PAPER_TRADING_DISCLAIMER = (
    "MODO SIMULADO: no se ejecutan ordenes reales ni se mueve dinero real. "
    "Este bot opera sobre precios en vivo pero con un portfolio virtual."
)


class CreatePaperBotRequest(BaseModel):
    symbol: str = Field(..., description="Formato ccxt, ej. 'BTC/USDT'")
    buy_score_threshold: int = Field(70, ge=0, le=100)
    sell_score_threshold: int = Field(30, ge=0, le=100)
    initial_capital: float = Field(1000, gt=0)
    kill_switch_pct: float = Field(20, gt=0, le=100)
    evaluation_interval_minutes: int = Field(15, ge=1, le=1440)

    @model_validator(mode="after")
    def validate_thresholds(self) -> "CreatePaperBotRequest":
        if self.buy_score_threshold <= self.sell_score_threshold:
            raise ValueError("buy_score_threshold debe ser mayor que sell_score_threshold")
        return self


class PaperTradeResponse(BaseModel):
    id: int
    side: TradeSide
    timestamp: str
    price: float
    quantity: float
    commission: float
    pnl_pct: Optional[float]
    equity_after: float


class PaperBotEventResponse(BaseModel):
    id: int
    event_type: str
    message: str
    created_at: str


class PaperBotEquityPointResponse(BaseModel):
    timestamp: str
    equity: float
    price: float


class PaperBotResponse(BaseModel):
    id: int
    user_id: str
    symbol: str
    buy_score_threshold: int
    sell_score_threshold: int
    initial_capital: float
    cash: float
    units_held: float
    current_equity: float
    pnl_pct: float
    kill_switch_pct: float
    evaluation_interval_minutes: int
    status: BotStatus
    created_at: str
    last_evaluated_at: Optional[str]
    disclaimer: str = PAPER_TRADING_DISCLAIMER


class PaperBotDetailResponse(PaperBotResponse):
    trades: List[PaperTradeResponse]
    events: List[PaperBotEventResponse]
    equity_curve: List[PaperBotEquityPointResponse]
