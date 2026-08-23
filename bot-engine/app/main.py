from fastapi import FastAPI

from app.routers import backtest, market, signals

app = FastAPI(title="TradingHub Bot Engine", version="0.1.0")

app.include_router(market.router)
app.include_router(signals.router)
app.include_router(backtest.router)


@app.get("/health")
def health():
    return {"status": "ok"}
