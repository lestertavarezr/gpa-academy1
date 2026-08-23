import enum
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.paper_trading.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class BotStatus(str, enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    STOPPED_KILL_SWITCH = "stopped_kill_switch"


class TradeSide(str, enum.Enum):
    BUY = "buy"
    SELL = "sell"


def _str_enum(enum_cls):
    # Persiste el .value en minuscula ("active") en vez del nombre del
    # miembro de Python ("ACTIVE"), que es el comportamiento por defecto de
    # SQLAlchemy y no coincide con lo que devuelven las respuestas de la API.
    return Enum(enum_cls, values_callable=lambda obj: [e.value for e in obj])


class PaperBot(Base):
    __tablename__ = "paper_bots"

    id = Column(Integer, primary_key=True)
    # Placeholder hasta que exista autenticacion real (no hay auth en esta fase).
    user_id = Column(String, nullable=False, default="default-user", index=True)
    symbol = Column(String, nullable=False)  # formato ccxt, ej. "BTC/USDT"

    buy_score_threshold = Column(Integer, nullable=False)
    sell_score_threshold = Column(Integer, nullable=False)

    initial_capital = Column(Float, nullable=False)
    cash = Column(Float, nullable=False)
    units_held = Column(Float, nullable=False, default=0.0)
    entry_price = Column(Float, nullable=True)  # precio de la posicion abierta, si hay una

    kill_switch_pct = Column(Float, nullable=False)
    high_water_mark = Column(Float, nullable=False)

    evaluation_interval_minutes = Column(Integer, nullable=False, default=15)
    status = Column(_str_enum(BotStatus), nullable=False, default=BotStatus.ACTIVE)

    last_evaluated_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)

    trades = relationship("PaperTrade", back_populates="bot", cascade="all, delete-orphan")
    events = relationship("PaperBotEvent", back_populates="bot", cascade="all, delete-orphan")
    equity_snapshots = relationship(
        "PaperBotEquitySnapshot", back_populates="bot", cascade="all, delete-orphan"
    )


class PaperTrade(Base):
    __tablename__ = "paper_trades"

    id = Column(Integer, primary_key=True)
    bot_id = Column(Integer, ForeignKey("paper_bots.id"), nullable=False, index=True)

    side = Column(_str_enum(TradeSide), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    price = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    commission = Column(Float, nullable=False)
    pnl_pct = Column(Float, nullable=True)  # solo se completa en la venta, relativo al precio de entrada
    equity_after = Column(Float, nullable=False)

    bot = relationship("PaperBot", back_populates="trades")


class PaperBotEvent(Base):
    __tablename__ = "paper_bot_events"

    id = Column(Integer, primary_key=True)
    bot_id = Column(Integer, ForeignKey("paper_bots.id"), nullable=False, index=True)

    # created | trade_executed | paused | kill_switch_triggered | evaluation_error
    event_type = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    bot = relationship("PaperBot", back_populates="events")


class PaperBotEquitySnapshot(Base):
    __tablename__ = "paper_bot_equity_snapshots"

    id = Column(Integer, primary_key=True)
    bot_id = Column(Integer, ForeignKey("paper_bots.id"), nullable=False, index=True)

    timestamp = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    equity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)

    bot = relationship("PaperBot", back_populates="equity_snapshots")
