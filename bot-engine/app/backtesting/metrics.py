import math
from typing import List, Optional

from app.backtesting.simulator import EquityPoint, Trade

# Cripto opera los 365 dias del anio (a diferencia de acciones, ~252 dias
# habiles), por eso se anualiza el Sharpe con 365.
TRADING_PERIODS_PER_YEAR = 365


def total_return_pct(initial_capital: float, final_equity: float) -> float:
    return (final_equity / initial_capital - 1) * 100


def max_drawdown_pct(equity_curve: List[EquityPoint]) -> float:
    """Peor caida porcentual desde un pico anterior. Devuelve un numero <= 0."""
    if not equity_curve:
        return 0.0

    peak = equity_curve[0].equity
    worst_drawdown = 0.0

    for point in equity_curve:
        peak = max(peak, point.equity)
        if peak > 0:
            drawdown = (point.equity - peak) / peak
            worst_drawdown = min(worst_drawdown, drawdown)

    return worst_drawdown * 100


def win_rate_pct(trades: List[Trade]) -> Optional[float]:
    closed_trades = [t for t in trades if t.pnl_pct is not None]
    if not closed_trades:
        return None

    wins = sum(1 for t in closed_trades if t.pnl_pct > 0)
    return wins / len(closed_trades) * 100


def sharpe_ratio(equity_curve: List[EquityPoint]) -> Optional[float]:
    """Sharpe anualizado sobre retornos diarios del equity de la estrategia. Asume tasa libre de riesgo = 0."""
    if len(equity_curve) < 2:
        return None

    daily_returns = []
    for prev, curr in zip(equity_curve, equity_curve[1:]):
        if prev.equity <= 0:
            continue
        daily_returns.append((curr.equity - prev.equity) / prev.equity)

    if len(daily_returns) < 2:
        return None

    mean_return = sum(daily_returns) / len(daily_returns)
    variance = sum((r - mean_return) ** 2 for r in daily_returns) / (len(daily_returns) - 1)
    std_dev = math.sqrt(variance)

    if std_dev == 0:
        return None

    return (mean_return / std_dev) * math.sqrt(TRADING_PERIODS_PER_YEAR)
