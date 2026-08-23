from datetime import datetime, timedelta, timezone

from app.backtesting.metrics import max_drawdown_pct, sharpe_ratio, total_return_pct, win_rate_pct
from app.backtesting.schemas import (
    BACKTEST_DISCLAIMER,
    BacktestMetrics,
    BacktestRequest,
    BacktestResponse,
    EquityPoint as EquityPointSchema,
    TradeRecord,
)
from app.backtesting.simulator import (
    COMMISSION_RATE,
    SLIPPAGE_RATE,
    run_buy_and_hold,
    run_strategy_simulation,
)
from app.market_data import fetch_historical_range

# Dias extra de historia que se piden ANTES de start_date, solo para que
# indicadores como la SMA200 ya tengan datos suficientes el primer dia
# evaluado. Estas filas de warmup nunca se usan para operar ni se incluyen
# en el equity_curve ni en las metricas.
WARMUP_DAYS = 250


def run_backtest(request: BacktestRequest) -> BacktestResponse:
    start_dt = datetime.combine(request.start_date, datetime.min.time(), tzinfo=timezone.utc)
    end_dt = datetime.combine(request.end_date, datetime.min.time(), tzinfo=timezone.utc)
    fetch_since = start_dt - timedelta(days=WARMUP_DAYS)

    df = fetch_historical_range(request.symbol, fetch_since, end_dt)

    start_ms = int(start_dt.timestamp() * 1000)
    eligible_rows = df.index[df["timestamp"] >= start_ms]
    if len(eligible_rows) == 0:
        raise ValueError("No hay datos suficientes en el rango solicitado")

    # Este es el indice donde arranca la EVALUACION (no los datos): todo lo
    # anterior es warmup de indicadores, nunca se opera ni se reporta.
    evaluation_start_idx = int(eligible_rows[0])

    if evaluation_start_idx >= len(df) - 1:
        raise ValueError("El rango solicitado no tiene suficientes velas para simular")

    strategy_curve, trades = run_strategy_simulation(
        df,
        evaluation_start_idx,
        request.buy_score_threshold,
        request.sell_score_threshold,
        request.initial_capital,
    )
    buy_hold_curve = run_buy_and_hold(df, evaluation_start_idx, request.initial_capital)

    strategy_final = strategy_curve[-1].equity if strategy_curve else request.initial_capital
    buy_hold_final = buy_hold_curve[-1].equity if buy_hold_curve else request.initial_capital

    strategy_return = total_return_pct(request.initial_capital, strategy_final)
    buy_hold_return = total_return_pct(request.initial_capital, buy_hold_final)

    metrics = BacktestMetrics(
        strategy_total_return_pct=round(strategy_return, 2),
        buy_hold_total_return_pct=round(buy_hold_return, 2),
        max_drawdown_pct=round(max_drawdown_pct(strategy_curve), 2),
        win_rate_pct=_round_or_none(win_rate_pct(trades)),
        sharpe_ratio=_round_or_none(sharpe_ratio(strategy_curve), 3),
        total_trades=len(trades),
    )

    equity_curve = [
        EquityPointSchema(
            timestamp=s.timestamp,
            strategy_equity=round(s.equity, 2),
            buy_hold_equity=round(b.equity, 2),
        )
        for s, b in zip(strategy_curve, buy_hold_curve)
    ]

    trade_records = [
        TradeRecord(
            entry_date=t.entry_date,
            entry_price=round(t.entry_price, 2),
            exit_date=t.exit_date,
            exit_price=round(t.exit_price, 2) if t.exit_price is not None else None,
            pnl_pct=round(t.pnl_pct, 2) if t.pnl_pct is not None else None,
        )
        for t in trades
    ]

    return BacktestResponse(
        symbol=request.symbol,
        start_date=request.start_date.isoformat(),
        end_date=request.end_date.isoformat(),
        initial_capital=request.initial_capital,
        buy_score_threshold=request.buy_score_threshold,
        sell_score_threshold=request.sell_score_threshold,
        commission_rate=COMMISSION_RATE,
        slippage_rate=SLIPPAGE_RATE,
        metrics=metrics,
        equity_curve=equity_curve,
        trades=trade_records,
        underperformed_buy_hold=strategy_return < buy_hold_return,
        disclaimer=BACKTEST_DISCLAIMER,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )


def _round_or_none(value, digits: int = 2):
    return round(value, digits) if value is not None else None
