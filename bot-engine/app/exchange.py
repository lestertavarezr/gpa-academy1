import ccxt

from app.config import settings


def get_exchange() -> ccxt.binance:
    """Crea un cliente ccxt de Binance apuntando siempre a TESTNET.

    set_sandbox_mode(True) redirige todas las llamadas a los endpoints
    de testnet.binance.vision en lugar de la API de produccion.
    """
    exchange = ccxt.binance(
        {
            "apiKey": settings.binance_testnet_api_key,
            "secret": settings.binance_testnet_api_secret,
            "enableRateLimit": True,
        }
    )
    exchange.set_sandbox_mode(True)
    return exchange


def get_public_exchange() -> ccxt.binance:
    """Cliente de Binance MAINNET, sin API keys, exclusivo para historia de precios.

    Se usa unicamente para backtesting (velas historicas de 2+ anios), ya que
    testnet no conserva historia profunda. Este cliente nunca recibe
    credenciales y en el codigo solo se invoca fetch_ohlcv sobre el: no tiene
    capacidad de autenticarse ni de crear ordenes, ni aunque se lo pidieran.
    """
    return ccxt.binance({"enableRateLimit": True})
