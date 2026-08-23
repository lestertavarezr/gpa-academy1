from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.backtesting.simulator import COMMISSION_RATE, SLIPPAGE_RATE
from app.paper_trading.models import (
    BotStatus,
    PaperBot,
    PaperBotEquitySnapshot,
    PaperBotEvent,
    PaperTrade,
    TradeSide,
)
from app.signals.engine import build_signal


def evaluate_bot(db: Session, bot: PaperBot) -> None:
    """Evalua UN bot con datos EN VIVO (no historicos) y ejecuta la operacion simulada si corresponde.

    Reusa exactamente el mismo motor de señales de la Fase 2 (build_signal)
    y las mismas constantes de comision/slippage validadas en el backtest de
    la Fase 3, para que el comportamiento del bot en paper trading sea
    consistente con lo que el usuario ya probo en el backtest.
    """
    if bot.status != BotStatus.ACTIVE:
        return

    try:
        signal = build_signal(bot.symbol)
    except Exception as exc:  # la API de Binance testnet puede fallar transitoriamente
        db.add(
            PaperBotEvent(
                bot_id=bot.id,
                event_type="evaluation_error",
                message=f"No se pudo evaluar el bot: {exc}",
            )
        )
        db.commit()
        return

    price = signal.indicators.price
    if price is None:
        return

    now = datetime.now(timezone.utc)
    score = signal.score

    if bot.units_held == 0 and score > bot.buy_score_threshold:
        _execute_buy(db, bot, price, now)
    elif bot.units_held > 0 and score < bot.sell_score_threshold:
        _execute_sell(db, bot, price, now)

    _mark_to_market_and_check_kill_switch(db, bot, price, now)

    bot.last_evaluated_at = now
    db.commit()


def _execute_buy(db: Session, bot: PaperBot, price: float, now: datetime) -> None:
    exec_price = price * (1 + SLIPPAGE_RATE)  # slippage adverso: pagamos mas al comprar
    commission = bot.cash * COMMISSION_RATE
    quantity = (bot.cash - commission) / exec_price

    db.add(
        PaperTrade(
            bot_id=bot.id,
            side=TradeSide.BUY,
            timestamp=now,
            price=exec_price,
            quantity=quantity,
            commission=commission,
            pnl_pct=None,
            equity_after=quantity * exec_price,
        )
    )
    db.add(
        PaperBotEvent(
            bot_id=bot.id,
            event_type="trade_executed",
            message=f"COMPRA simulada de {bot.symbol}: {quantity:.6f} unidades a {exec_price:.2f}",
        )
    )

    bot.entry_price = exec_price
    bot.units_held = quantity
    bot.cash = 0.0


def _execute_sell(db: Session, bot: PaperBot, price: float, now: datetime) -> None:
    exec_price = price * (1 - SLIPPAGE_RATE)  # slippage adverso: recibimos menos al vender
    gross_proceeds = bot.units_held * exec_price
    commission = gross_proceeds * COMMISSION_RATE
    net_proceeds = gross_proceeds - commission
    pnl_pct = (exec_price - bot.entry_price) / bot.entry_price * 100 if bot.entry_price else None

    db.add(
        PaperTrade(
            bot_id=bot.id,
            side=TradeSide.SELL,
            timestamp=now,
            price=exec_price,
            quantity=bot.units_held,
            commission=commission,
            pnl_pct=pnl_pct,
            equity_after=net_proceeds,
        )
    )
    pnl_text = f"{pnl_pct:.2f}%" if pnl_pct is not None else "N/D"
    db.add(
        PaperBotEvent(
            bot_id=bot.id,
            event_type="trade_executed",
            message=f"VENTA simulada de {bot.symbol}: PnL {pnl_text}",
        )
    )

    bot.cash = net_proceeds
    bot.units_held = 0.0
    bot.entry_price = None


def _mark_to_market_and_check_kill_switch(db: Session, bot: PaperBot, price: float, now: datetime) -> None:
    equity = bot.cash + bot.units_held * price
    db.add(PaperBotEquitySnapshot(bot_id=bot.id, timestamp=now, equity=equity, price=price))

    bot.high_water_mark = max(bot.high_water_mark, equity)
    if bot.high_water_mark <= 0:
        return

    drawdown_pct = (equity - bot.high_water_mark) / bot.high_water_mark * 100

    if drawdown_pct <= -bot.kill_switch_pct:
        bot.status = BotStatus.STOPPED_KILL_SWITCH
        db.add(
            PaperBotEvent(
                bot_id=bot.id,
                event_type="kill_switch_triggered",
                message=(
                    f"Kill switch activado: drawdown de {drawdown_pct:.2f}% "
                    f"supero el limite de {bot.kill_switch_pct}%. Bot pausado automaticamente."
                ),
            )
        )
