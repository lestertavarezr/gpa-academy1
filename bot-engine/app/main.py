from fastapi import FastAPI

from app.routers import market

app = FastAPI(title="TradingHub Bot Engine", version="0.1.0")

app.include_router(market.router)


@app.get("/health")
def health():
    return {"status": "ok"}
