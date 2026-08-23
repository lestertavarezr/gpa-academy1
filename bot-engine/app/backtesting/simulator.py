from dataclasses import dataclass
from typing import List, Optional, Tuple

import pandas as pd

from app.signals.engine import compute_snapshot

# Comisiones y slippage fijos, no configurables por el usuario: un backtest
# "sin costos" es la forma mas comun de inflar resultados falsos.
# 0.1% es la fee taker tipica de Binance spot; 0.05% es una estimacion
# conservadora de slippage para pares liquidos como BTC/ETH/SOL contra USDT.
COMMISSION_RATE = 0.001
SLIPPAGE_RATE = 0.0005


@dataclass
class Trade:
    entry_date: str
    entry_price: float
    exit_date: Optional[str] = None
    exit_price: Optional[float] = None
    pnl_pct: Optional[float] = None


@dataclass
class EquityPoint:
    timestamp: int
    equity: float


def run_strategy_simulation(
    df: pd.DataFrame,
    evaluation_start_idx: int,
    buy_threshold: int,
    sell_threshold: int,
    initial_capital: float,
) -> Tuple[List[EquityPoint], List[Trade]]:
    """Simula la estrategia vela a vela sin look-ahead bias.

    Estructura de cada iteracion (en este orden, es importante):
      1. Ejecutar una orden PENDIENTE que fue decidida ayer con el cierre de
         ayer, al precio de APERTURA de hoy. Nunca se ejecuta al precio de
         cierre del mismo dia que genero la señal: eso escondería look-ahead,
         porque en la realidad nadie puede operar al precio de cierre de la
         vela que todavia esta formandose cuando la señal se calcula con ese
         mismo cierre.
      2. Calcular la señal de HOY usando unicamente df.iloc[:i+1] (nunca
         df.iloc[i+1:] ni nada posterior) para decidir la accion de MAÑANA.
      3. Marcar el equity a mercado con el cierre de HOY.
    """
    cash = initial_capital
    units = 0.0
    in_position = False
    entry_price: Optional[float] = None
    entry_date: Optional[str] = None
    pending_action: Optional[str] = None

    trades: List[Trade] = []
    equity_curve: List[EquityPoint] = []

    for i in range(evaluation_start_idx, len(df)):
        today_open = float(df["open"].iloc[i])
        today_close = float(df["close"].iloc[i])
        today_timestamp = int(df["timestamp"].iloc[i])
        today_date = pd.to_datetime(today_timestamp, unit="ms").strftime("%Y-%m-%d")

        # (1) Ejecutar la orden decidida AYER, al open de HOY.
        if pending_action == "buy" and not in_position:
            exec_price = today_open * (1 + SLIPPAGE_RATE)  # slippage adverso: pagamos mas al comprar
            units = (cash * (1 - COMMISSION_RATE)) / exec_price
            cash = 0.0
            in_position = True
            entry_price = exec_price
            entry_date = today_date
        elif pending_action == "sell" and in_position:
            exec_price = today_open * (1 - SLIPPAGE_RATE)  # slippage adverso: recibimos menos al vender
            proceeds = units * exec_price * (1 - COMMISSION_RATE)
            pnl_pct = (exec_price - entry_price) / entry_price * 100
            trades.append(
                Trade(
                    entry_date=entry_date,
                    entry_price=entry_price,
                    exit_date=today_date,
                    exit_price=exec_price,
                    pnl_pct=pnl_pct,
                )
            )
            cash = proceeds
            units = 0.0
            in_position = False
            entry_price = None
            entry_date = None
        pending_action = None

        # (2) Con el cierre de HOY, calcular la señal para decidir MAÑANA.
        #     CRITICO anti look-ahead: esta porcion del DataFrame solo llega
        #     hasta la fila `i` inclusive. Las filas i+1 en adelante no
        #     existen todavia para esta llamada, por construccion.
        history_slice = df.iloc[: i + 1]
        snapshot = compute_snapshot(history_slice)

        if not in_position and snapshot.score > buy_threshold:
            pending_action = "buy"
        elif in_position and snapshot.score < sell_threshold:
            pending_action = "sell"

        # (3) Marcar a mercado con el cierre de HOY (no con precios futuros).
        equity_curve.append(EquityPoint(timestamp=today_timestamp, equity=cash + units * today_close))

    # Nota: si queda una posicion abierta al final del periodo, NO se fuerza
    # su liquidacion aqui. El ultimo punto del equity_curve ya la refleja
    # marcada a mercado (mark-to-market) con el cierre del ultimo dia, igual
    # que buy&hold — asi ambas curvas se comparan en las mismas condiciones,
    # sin cargarle a la estrategia un costo de salida que buy&hold nunca paga.
    # Esa posicion abierta tampoco cuenta como "trade cerrado" en las metricas
    # (win_rate solo mira trades con pnl_pct definido).
    return equity_curve, trades


def run_buy_and_hold(
    df: pd.DataFrame, evaluation_start_idx: int, initial_capital: float
) -> List[EquityPoint]:
    """Compra todo el capital en la apertura del primer dia evaluado y lo mantiene sin operar mas.

    Se aplica la comision una unica vez (una sola operacion de entrada), para
    que la comparacion con la estrategia sea justa: ambas parten del mismo
    capital neto de costos de entrada.
    """
    entry_price = float(df["open"].iloc[evaluation_start_idx])
    units = (initial_capital * (1 - COMMISSION_RATE)) / entry_price

    equity_curve = []
    for i in range(evaluation_start_idx, len(df)):
        timestamp = int(df["timestamp"].iloc[i])
        close = float(df["close"].iloc[i])
        equity_curve.append(EquityPoint(timestamp=timestamp, equity=units * close))

    return equity_curve
