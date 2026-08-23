from fastapi import APIRouter

from app.signals.engine import build_signal
from app.signals.schemas import SignalResponse
from app.symbols import resolve_symbol

router = APIRouter(prefix="/signals", tags=["signals"])


@router.get("/{symbol}", response_model=SignalResponse)
def get_signal(symbol: str) -> SignalResponse:
    ccxt_symbol = resolve_symbol(symbol)
    return build_signal(ccxt_symbol)
