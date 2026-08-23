# TradingHub SaaS — Fase 1 + Fase 2 + Fase 3

Setup del monorepo: conexión a Binance **TESTNET**, cálculo de indicadores
técnicos, un motor de señales de mercado (score interpretable 0-100) y un
motor de backtesting, para BTC/USDT, ETH/USDT y SOL/USDT, expuestos al
frontend con cache en Redis y con histórico en PostgreSQL.

**Todo es de solo lectura.** No se ejecutan órdenes de compra/venta y todo
corre contra el entorno de pruebas de Binance, nunca contra una cuenta real.

## Estructura

```
frontend/     Next.js 14 (App Router) + TypeScript + Tailwind + Recharts
backend/      NestJS — expone market-data y signals al frontend, cache Redis,
              histórico de señales en Postgres (TypeORM) + cron de evaluación
bot-engine/   Python FastAPI + ccxt — habla directamente con Binance testnet,
              calcula indicadores y genera el score de señales
```

Flujo de datos: `frontend → backend (NestJS) → bot-engine (FastAPI) → Binance testnet`

## Requisitos previos

- Node.js 18+
- Python 3.10+
- Docker (para Postgres y Redis locales) o instalaciones nativas de ambos
- Una cuenta de [Binance Spot Testnet](https://testnet.binance.vision/) con
  API key/secret de prueba (opcional para los endpoints públicos de precio,
  pero recomendado para no depender de límites anónimos).

## 0. Infraestructura local (Postgres + Redis)

```bash
docker compose up -d
```

Levanta Postgres en `localhost:5432` (db `tradinghub`, user/pass `postgres`)
y Redis en `localhost:6379`. Si preferís no usar Docker, cualquier Postgres/Redis
locales sirven mientras coincidan con las URLs de `backend/.env.example`.

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

Verificar:
- `http://localhost:8000/market/BTC-USDT`
- `http://localhost:8000/signals/BTC-USDT`
- `POST http://localhost:8000/backtest` (body: `{"symbol": "BTC/USDT", "start_date": "2022-01-01", "end_date": "2024-01-01", "buy_score_threshold": 70, "sell_score_threshold": 30, "initial_capital": 10000}`)

Símbolos soportados: `BTC-USDT`, `ETH-USDT`, `SOL-USDT` en las rutas GET
(formato con guion en la URL, se resuelven al par de ccxt `BTC/USDT`, etc.)
y `BTC/USDT`, `ETH/USDT`, `SOL/USDT` en el body JSON de `/backtest`.

**Nota sobre datos históricos**: `/backtest` trae velas de **Binance MAINNET**
público (sin API keys, solo lectura de `fetch_ohlcv`) porque testnet no
conserva 2+ años de historia. El resto de los endpoints (`/market`, `/signals`)
sigue exclusivamente contra testnet. Ver `bot-engine/app/exchange.py`.

## 2. backend (NestJS)

```bash
cd backend
npm install

cp .env.example .env
# BOT_ENGINE_URL, REDIS_URL y DATABASE_URL por defecto ya apuntan a localhost

npm run start:dev
```

Verificar:
- `http://localhost:3001/market-data/BTC-USDT`
- `http://localhost:3001/signals/BTC-USDT` (cachea 1-5 min en Redis y guarda
  la señal en Postgres en cada cálculo fresco)
- `http://localhost:3001/signal-history/BTC-USDT` (histórico de señales
  guardadas, con su resultado una vez evaluadas)
- `POST http://localhost:3001/backtest` (mismo body que el bot-engine; lo
  proxea, persiste el resultado en Postgres y lo devuelve)
- `http://localhost:3001/backtest/history/BTC-USDT` (backtests corridos
  anteriormente para ese símbolo)

En modo desarrollo la conexión a Postgres usa `synchronize: true` (TypeORM
crea las tablas automáticamente); antes de producción esto debe reemplazarse
por migraciones.

## 3. frontend (Next.js)

```bash
cd frontend
npm install

cp .env.local.example .env.local
# NEXT_PUBLIC_BACKEND_URL debe apuntar al backend (por defecto http://localhost:3001)

npm run dev
```

- `http://localhost:3000/dashboard` — vista simple de precio/RSI/SMA (Fase 1)
- `http://localhost:3000/market-analysis` — Análisis de Mercado (Fase 2):
  score con gauge, desglose de indicadores que lo componen, gráfico de precio
  con medias móviles superpuestas, y selector de activo (BTC/ETH/SOL)
- `http://localhost:3000/backtesting` — Backtesting (Fase 3): formulario de
  estrategia (activo, fechas, umbrales de score, capital), gráfico de equity
  estrategia vs. buy&hold, tabla de métricas y advertencia destacada si la
  estrategia no superó a buy&hold

## Variables de entorno

| Servicio    | Variable                       | Descripción                                        |
|-------------|---------------------------------|-----------------------------------------------------|
| bot-engine  | `BINANCE_TESTNET_API_KEY`      | API key de Binance **testnet**                      |
| bot-engine  | `BINANCE_TESTNET_API_SECRET`   | API secret de Binance **testnet**                   |
| backend     | `BOT_ENGINE_URL`               | URL del servicio bot-engine                          |
| backend     | `PORT`                         | Puerto del backend (default `3001`)                  |
| backend     | `REDIS_URL`                    | Conexión a Redis (cache de señales)                  |
| backend     | `SIGNAL_CACHE_TTL_SECONDS`     | TTL del cache de señales, 1-5 min recomendado        |
| backend     | `DATABASE_URL`                 | Conexión a Postgres (histórico de señales)           |
| frontend    | `NEXT_PUBLIC_BACKEND_URL`      | URL del backend NestJS                               |

Ninguna API key se expone al frontend ni se hardcodea en el código: viven
únicamente en el `.env` del bot-engine, el único servicio que habla con
Binance.

## El motor de señales (Fase 2)

`GET /signals/{symbol}` combina RSI(14), MACD, Bandas de Bollinger, SMA/EMA
20/50/200 y volumen relativo (30d) en un **score de 0 a 100** (50 = neutral).
Cada regla que se dispara (ver `bot-engine/app/signals/scoring.py`) suma o
resta puntos y queda registrada en `contributions`, con el indicador exacto
que la originó y una explicación en texto — el score nunca es una caja negra.

Cada respuesta incluye siempre: `score`, `bias` (`bullish`/`bearish`/`neutral`),
`contributions`, `indicators` (snapshot completo), `price_history` (para
graficar precio + SMAs) y el campo `disclaimer` obligatorio.

### Histórico de precisión

Cada vez que el backend calcula una señal fresca (no servida desde cache) la
guarda en la tabla `signal_records` de Postgres. Un cron (`@nestjs/schedule`,
corre cada hora) revisa señales con ≥24h de antigüedad sin evaluar, compara
el precio actual contra el precio al momento de la señal, y marca el
resultado (`correct` / `incorrect` / `neutral` según si el precio se movió a
favor del sesgo de la señal). Esto sienta la base para reportar precisión
histórica en una fase posterior; `GET /signal-history/{symbol}` expone el
registro crudo para verificarlo.

## El motor de backtesting (Fase 3)

`POST /backtest` simula, vela a vela, cómo se hubiera comportado la
estrategia "comprar cuando score > X, vender cuando score < Y" contra
historia real, comparándola siempre contra buy & hold en el mismo período.

**Cómo se evita el look-ahead bias** (ver comentarios en
`bot-engine/app/backtesting/simulator.py`): la función `compute_snapshot`
(compartida con el endpoint `/signals` en vivo) es pura y solo ve las filas
del DataFrame que se le pasan. El simulador le pasa `df.iloc[:i+1]` en cada
paso — nunca tiene acceso estructuralmente a datos posteriores al día
evaluado. Además, decisión y ejecución están separadas en el tiempo: la
señal se calcula con el **cierre** del día `i`, pero la orden resultante se
ejecuta recién en la **apertura** del día `i+1` (nunca al cierre del mismo
día que generó la señal). Esto está cubierto por un test que instrumenta
`compute_snapshot` y verifica que ningún cálculo vio jamás una fila
posterior a la que le correspondía.

Se aplican siempre comisión (0.1%, fee taker típica de Binance spot) y
slippage (0.05%) en cada operación simulada — no son configurables por el
usuario para que no se pueda correr un backtest "sin costos".

Métricas devueltas: retorno total de la estrategia, retorno de buy & hold,
máximo drawdown, win rate, Sharpe ratio (anualizado con 365 períodos/año,
tasa libre de riesgo = 0) y número total de operaciones. Si el retorno de la
estrategia es menor al de buy & hold, `underperformed_buy_hold: true` viaja
en la respuesta y el frontend muestra una advertencia destacada — nunca se
oculta ni se suaviza ese resultado.

Cada backtest ejecutado (parámetros + curva de equity + métricas) se guarda
en la tabla `backtest_records` de Postgres vía el backend, para no perder el
historial de pruebas.

## Notas de seguridad y alcance de esta fase

- Todo el tráfico de mercado en vivo (`/market`, `/signals`) va contra
  `testnet.binance.vision` (`exchange.set_sandbox_mode(True)` en
  `bot-engine/app/exchange.py`). Solo `/backtest` usa Binance mainnet, y
  exclusivamente para leer velas históricas (sin API keys).
- No hay ejecución de órdenes en ningún endpoint: solo se leen ticker, velas
  históricas, se calculan indicadores/señales y se simulan estrategias sobre
  datos ya ocurridos.
- Cada respuesta de mercado, de señales y de backtest incluye un
  `disclaimer` en el JSON (no solo en el frontend) recordando que los datos
  son informativos y no constituyen asesoría financiera ni garantía de
  resultados.
- Los archivos `.env` están en `.gitignore`; usar los `*.env.example` como
  plantilla.

## Próximas fases (fuera de alcance aquí)

Autenticación con 2FA, ejecución de órdenes, gestión de estrategias del bot,
reporte visual de precisión histórica de señales y de backtests pasados, y
diseño visual definitivo se abordarán en fases posteriores.
