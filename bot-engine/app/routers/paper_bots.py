from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.paper_trading import service
from app.paper_trading.database import get_session
from app.paper_trading.schemas import CreatePaperBotRequest, PaperBotDetailResponse, PaperBotResponse
from app.symbols import validate_ccxt_symbol

router = APIRouter(prefix="/paper-bots", tags=["paper-bots"])


@router.post("", response_model=PaperBotResponse)
def create_paper_bot(request: CreatePaperBotRequest, db: Session = Depends(get_session)):
    validate_ccxt_symbol(request.symbol)
    return service.create_bot(db, request)


@router.get("", response_model=List[PaperBotResponse])
def list_paper_bots(db: Session = Depends(get_session)):
    return service.list_bots(db)


@router.get("/{bot_id}", response_model=PaperBotDetailResponse)
def get_paper_bot(bot_id: int, db: Session = Depends(get_session)):
    detail = service.get_bot_detail(db, bot_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Bot no encontrado")
    return detail


@router.patch("/{bot_id}/pause", response_model=PaperBotResponse)
def pause_paper_bot(bot_id: int, db: Session = Depends(get_session)):
    result = service.pause_bot(db, bot_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Bot no encontrado")
    return result


@router.delete("/{bot_id}", status_code=204)
def delete_paper_bot(bot_id: int, db: Session = Depends(get_session)):
    deleted = service.delete_bot(db, bot_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Bot no encontrado")
