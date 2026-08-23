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
