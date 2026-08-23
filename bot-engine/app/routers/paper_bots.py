from typing import List

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.paper_trading import service
from app.paper_trading.database import get_session
from app.paper_trading.schemas import CreatePaperBotRequest, PaperBotDetailResponse, PaperBotResponse
from app.symbols import validate_ccxt_symbol

router = APIRouter(prefix="/paper-bots", tags=["paper-bots"])

# Este servicio no valida JWT: confia en que solo el backend (NestJS) le
# habla, y en que el backend ya autentico al usuario y le reenvia su id real
# en este header. El bot-engine no deberia quedar expuesto directo a internet.
UserIdHeader = Header(..., alias="X-User-Id")


@router.post("", response_model=PaperBotResponse)
def create_paper_bot(
    request: CreatePaperBotRequest, x_user_id: str = UserIdHeader, db: Session = Depends(get_session)
):
    validate_ccxt_symbol(request.symbol)
    return service.create_bot(db, request, user_id=x_user_id)


@router.get("", response_model=List[PaperBotResponse])
def list_paper_bots(x_user_id: str = UserIdHeader, db: Session = Depends(get_session)):
    return service.list_bots(db, user_id=x_user_id)


@router.get("/{bot_id}", response_model=PaperBotDetailResponse)
def get_paper_bot(bot_id: int, x_user_id: str = UserIdHeader, db: Session = Depends(get_session)):
    detail = service.get_bot_detail(db, bot_id, user_id=x_user_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Bot no encontrado")
    return detail


@router.patch("/{bot_id}/pause", response_model=PaperBotResponse)
def pause_paper_bot(bot_id: int, x_user_id: str = UserIdHeader, db: Session = Depends(get_session)):
    result = service.pause_bot(db, bot_id, user_id=x_user_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Bot no encontrado")
    return result


@router.delete("/{bot_id}", status_code=204)
def delete_paper_bot(bot_id: int, x_user_id: str = UserIdHeader, db: Session = Depends(get_session)):
    deleted = service.delete_bot(db, bot_id, user_id=x_user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Bot no encontrado")
