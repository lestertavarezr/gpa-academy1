import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    binance_testnet_api_key: str = os.getenv("BINANCE_TESTNET_API_KEY", "")
    binance_testnet_api_secret: str = os.getenv("BINANCE_TESTNET_API_SECRET", "")
    symbol: str = os.getenv("MARKET_SYMBOL", "BTC/USDT")


settings = Settings()
