from fastapi import FastAPI

from app.paper_trading.database import init_db
from app.routers import backtest, market, paper_bots, signals

app = FastAPI(title="TradingHub Bot Engine", version="0.1.0")

app.include_router(market.router)
app.include_router(signals.router)
app.include_router(backtest.router)
app.include_router(paper_bots.router)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}
