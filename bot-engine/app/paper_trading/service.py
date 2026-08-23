from typing import List, Optional

from sqlalchemy.orm import Session

from app.paper_trading.models import BotStatus, PaperBot, PaperBotEvent, PaperBotEquitySnapshot, PaperTrade
from app.paper_trading.schemas import (
    CreatePaperBotRequest,
    PaperBotDetailResponse,
    PaperBotEquityPointResponse,
    PaperBotEventResponse,
    PaperBotResponse,
    PaperTradeResponse,
)


def create_bot(db: Session, request: CreatePaperBotRequest, user_id: str) -> PaperBotResponse:
    bot = PaperBot(
        user_id=user_id,
        symbol=request.symbol,
        buy_score_threshold=request.buy_score_threshold,
        sell_score_threshold=request.sell_score_threshold,
        initial_capital=request.initial_capital,
        cash=request.initial_capital,
        units_held=0.0,
        kill_switch_pct=request.kill_switch_pct,
        high_water_mark=request.initial_capital,
        evaluation_interval_minutes=request.evaluation_interval_minutes,
        status=BotStatus.ACTIVE,
    )
    db.add(bot)
    db.flush()  # asigna bot.id sin cerrar la transaccion, para poder loguear el evento de creacion

    db.add(
        PaperBotEvent(
            bot_id=bot.id,
            event_type="created",
            message=f"Bot creado para {bot.symbol} con capital virtual {bot.initial_capital}",
        )
    )
    db.commit()
    db.refresh(bot)
    return _to_summary(db, bot)


def list_bots(db: Session, user_id: str) -> List[PaperBotResponse]:
    bots = (
        db.query(PaperBot)
        .filter(PaperBot.user_id == user_id)
        .order_by(PaperBot.created_at.desc())
        .all()
    )
    return [_to_summary(db, bot) for bot in bots]


def get_bot(db: Session, bot_id: int, user_id: str) -> Optional[PaperBot]:
    """Filtra SIEMPRE por user_id: un bot de otro usuario debe comportarse
    igual que un bot inexistente (404), nunca revelar que existe con un 403."""
    return db.query(PaperBot).filter(PaperBot.id == bot_id, PaperBot.user_id == user_id).first()


def get_bot_detail(db: Session, bot_id: int, user_id: str) -> Optional[PaperBotDetailResponse]:
    bot = get_bot(db, bot_id, user_id)
    if bot is None:
        return None

    summary = _to_summary(db, bot)

    trades = (
        db.query(PaperTrade)
        .filter(PaperTrade.bot_id == bot_id)
        .order_by(PaperTrade.timestamp.asc())
        .all()
    )
    events = (
        db.query(PaperBotEvent)
        .filter(PaperBotEvent.bot_id == bot_id)
        .order_by(PaperBotEvent.created_at.asc())
        .all()
    )
    snapshots = (
        db.query(PaperBotEquitySnapshot)
        .filter(PaperBotEquitySnapshot.bot_id == bot_id)
        .order_by(PaperBotEquitySnapshot.timestamp.asc())
        .all()
    )

    return PaperBotDetailResponse(
        **summary.model_dump(),
        trades=[
            PaperTradeResponse(
                id=t.id,
                side=t.side,
                timestamp=t.timestamp.isoformat(),
                price=round(t.price, 2),
                quantity=t.quantity,
                commission=round(t.commission, 4),
                pnl_pct=round(t.pnl_pct, 2) if t.pnl_pct is not None else None,
                equity_after=round(t.equity_after, 2),
            )
            for t in trades
        ],
        events=[
            PaperBotEventResponse(
                id=e.id, event_type=e.event_type, message=e.message, created_at=e.created_at.isoformat()
            )
            for e in events
        ],
        equity_curve=[
            PaperBotEquityPointResponse(
                timestamp=s.timestamp.isoformat(), equity=round(s.equity, 2), price=round(s.price, 2)
            )
            for s in snapshots
        ],
    )


def pause_bot(db: Session, bot_id: int, user_id: str) -> Optional[PaperBotResponse]:
    bot = get_bot(db, bot_id, user_id)
    if bot is None:
        return None

    bot.status = BotStatus.PAUSED
    db.add(PaperBotEvent(bot_id=bot.id, event_type="paused", message="Bot pausado manualmente"))
    db.commit()
    db.refresh(bot)
    return _to_summary(db, bot)


def delete_bot(db: Session, bot_id: int, user_id: str) -> bool:
    bot = get_bot(db, bot_id, user_id)
    if bot is None:
        return False

    db.delete(bot)  # cascade elimina trades/events/snapshots asociados
    db.commit()
    return True


def _latest_equity(db: Session, bot: PaperBot) -> float:
    latest = (
        db.query(PaperBotEquitySnapshot)
        .filter(PaperBotEquitySnapshot.bot_id == bot.id)
        .order_by(PaperBotEquitySnapshot.timestamp.desc())
        .first()
    )
    # Sin snapshots todavia (bot recien creado, aun no evaluado): no hay
    # posicion abierta por construccion, asi que el equity es simplemente el cash.
    return latest.equity if latest is not None else bot.cash


def _to_summary(db: Session, bot: PaperBot) -> PaperBotResponse:
    equity = _latest_equity(db, bot)
    pnl_pct = (equity - bot.initial_capital) / bot.initial_capital * 100 if bot.initial_capital else 0.0

    return PaperBotResponse(
        id=bot.id,
        user_id=bot.user_id,
        symbol=bot.symbol,
        buy_score_threshold=bot.buy_score_threshold,
        sell_score_threshold=bot.sell_score_threshold,
        initial_capital=bot.initial_capital,
        cash=round(bot.cash, 2),
        units_held=bot.units_held,
        current_equity=round(equity, 2),
        pnl_pct=round(pnl_pct, 2),
        kill_switch_pct=bot.kill_switch_pct,
        evaluation_interval_minutes=bot.evaluation_interval_minutes,
        status=bot.status,
        created_at=bot.created_at.isoformat(),
        last_evaluated_at=bot.last_evaluated_at.isoformat() if bot.last_evaluated_at else None,
    )
