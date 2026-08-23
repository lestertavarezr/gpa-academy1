from fastapi import APIRouter, HTTPException

from app.backtesting.engine import run_backtest
from app.backtesting.schemas import BacktestRequest, BacktestResponse
from app.symbols import validate_ccxt_symbol

router = APIRouter(prefix="/backtest", tags=["backtest"])


@router.post("", response_model=BacktestResponse)
def post_backtest(request: BacktestRequest) -> BacktestResponse:
    validate_ccxt_symbol(request.symbol)

    try:
        return run_backtest(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
