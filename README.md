# TradingHub SaaS — Fase 1

Setup inicial del monorepo: conexión a Binance **TESTNET**, cálculo de RSI y
medias móviles (SMA 20/50/200) sobre BTC/USDT, y exposición de esos datos a
través del backend hacia el frontend.

**Esta fase es solo de lectura.** No se ejecutan órdenes de compra/venta y
todo corre contra el entorno de pruebas de Binance, nunca contra una cuenta
real.

## Estructura

```
frontend/     Next.js 14 (App Router) + TypeScript + Tailwind
backend/      NestJS — expone /market-data/btc-usdt al frontend
bot-engine/   Python FastAPI + ccxt — habla directamente con Binance testnet
```

Flujo de datos: `frontend → backend (NestJS) → bot-engine (FastAPI) → Binance testnet`

## Requisitos previos

- Node.js 18+
- Python 3.10+
- Una cuenta de [Binance Spot Testnet](https://testnet.binance.vision/) con
  API key/secret de prueba (opcional para los endpoints públicos de precio,
  pero recomendado para no depender de límites anónimos).

## 1. bot-engine (Python FastAPI)

```bash
cd bot-engine
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Editar .env y completar BINANCE_TESTNET_API_KEY / BINANCE_TESTNET_API_SECRET

uvicorn app.main:app --reload --port 8000
```

Verificar: `http://localhost:8000/market/btc-usdt`

## 2. backend (NestJS)

```bash
cd backend
npm install

cp .env.example .env
# BOT_ENGINE_URL debe apuntar al bot-engine (por defecto http://localhost:8000)

npm run start:dev
```

Verificar: `http://localhost:3001/market-data/btc-usdt`

## 3. frontend (Next.js)

```bash
cd frontend
npm install

cp .env.local.example .env.local
# NEXT_PUBLIC_BACKEND_URL debe apuntar al backend (por defecto http://localhost:3001)

npm run dev
```

Abrir `http://localhost:3000/dashboard`.

## Variables de entorno

| Servicio    | Variable                       | Descripción                                  |
|-------------|---------------------------------|-----------------------------------------------|
| bot-engine  | `BINANCE_TESTNET_API_KEY`      | API key de Binance **testnet**                |
| bot-engine  | `BINANCE_TESTNET_API_SECRET`   | API secret de Binance **testnet**             |
| bot-engine  | `MARKET_SYMBOL`                | Par a consultar (default `BTC/USDT`)          |
| backend     | `BOT_ENGINE_URL`               | URL del servicio bot-engine                   |
| backend     | `PORT`                         | Puerto del backend (default `3001`)           |
| frontend    | `NEXT_PUBLIC_BACKEND_URL`      | URL del backend NestJS                        |

Ninguna API key se expone al frontend ni se hardcodea en el código: viven
únicamente en el `.env` del bot-engine, el único servicio que habla con
Binance.

## Notas de seguridad y alcance de esta fase

- Todo el tráfico de mercado va contra `testnet.binance.vision`
  (`exchange.set_sandbox_mode(True)` en `bot-engine/app/exchange.py`).
- No hay ejecución de órdenes: solo se leen ticker y velas históricas.
- Cada respuesta de mercado incluye un campo `disclaimer` recordando que los
  datos son informativos y no constituyen asesoría financiera.
- Los archivos `.env` están en `.gitignore`; usar los `*.env.example` como
  plantilla.

## Próximas fases (fuera de alcance aquí)

Autenticación con 2FA, ejecución de órdenes, gestión de estrategias del bot,
y diseño visual del dashboard se abordarán en fases posteriores.
