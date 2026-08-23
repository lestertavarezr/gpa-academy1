# TradingHub SaaS — Fase 1 + Fase 2 + Fase 3 + Fase 4 + Fase 4.5

Setup del monorepo: conexión a Binance **TESTNET**, cálculo de indicadores
técnicos, un motor de señales de mercado (score interpretable 0-100), un
motor de backtesting, bots de **paper trading** (simulados, con precios en
vivo) y autenticación con **2FA obligatorio**, para BTC/USDT, ETH/USDT y
SOL/USDT, expuestos al frontend con cache en Redis y con histórico en
PostgreSQL.

**Todo es de solo lectura.** No se ejecutan órdenes de compra/venta y todo
corre contra el entorno de pruebas de Binance, nunca contra una cuenta real.

## Estructura

```
frontend/     Next.js 14 (App Router) + TypeScript + Tailwind + Recharts
backend/      NestJS — gateway unico del frontend: proxea a bot-engine,
              cache Redis, histórico de señales/backtests en Postgres (TypeORM)
bot-engine/   Python FastAPI + ccxt — habla con Binance, calcula indicadores,
              corre backtests, y ejecuta los bots de paper trading via Celery
```

Flujo de datos: `frontend → backend (NestJS) → bot-engine (FastAPI) → Binance testnet`

## Requisitos previos

- Node.js 18+
- Python 3.10+
- Docker — para Postgres/Redis en desarrollo local, o para los 5 servicios
  completos si vas a correrlo en un servidor varios días (ver más abajo)
- Redis tambien se usa como broker de Celery (paper trading), ver Fase 4 abajo
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

### 1.1 Worker de paper trading (Celery)

Los bots de paper trading (Fase 4) corren en un proceso aparte, no en el de
`uvicorn`. Con el mismo entorno virtual activado, en otra terminal:

```bash
cd bot-engine
celery -A app.celery_app worker -B --loglevel=info
```

El flag `-B` embebe Celery Beat (el scheduler) en el mismo proceso — valido
para desarrollo. En producción, worker y beat deberían ser procesos
separados. El worker necesita las mismas variables de entorno que `uvicorn`
(`DATABASE_URL`, `CELERY_BROKER_URL`, credenciales de testnet).

## 2. backend (NestJS)

```bash
cd backend
npm install

cp .env.example .env
# BOT_ENGINE_URL, REDIS_URL y DATABASE_URL por defecto ya apuntan a localhost

npm run start:dev
```

Verificar:
- `http://localhost:3001/health` (usado también por el `HEALTHCHECK` de Docker)
- `http://localhost:3001/market-data/BTC-USDT`
- `http://localhost:3001/signals/BTC-USDT` (cachea 1-5 min en Redis y guarda
  la señal en Postgres en cada cálculo fresco)
- `http://localhost:3001/signal-history/BTC-USDT` (histórico de señales
  guardadas, con su resultado una vez evaluadas)
- `POST http://localhost:3001/backtest` (mismo body que el bot-engine; lo
  proxea, persiste el resultado en Postgres y lo devuelve)
- `http://localhost:3001/backtest/history/BTC-USDT` (backtests corridos
  anteriormente para ese símbolo)
- `POST http://localhost:3001/paper-bots` (crear un bot de paper trading;
  body: `{"symbol": "BTC/USDT", "buy_score_threshold": 70, "sell_score_threshold": 30, "initial_capital": 1000, "kill_switch_pct": 20, "evaluation_interval_minutes": 15}`)
- `http://localhost:3001/paper-bots` (listar bots), `GET /paper-bots/:id`
  (detalle con trades + equity), `PATCH /paper-bots/:id/pause`,
  `DELETE /paper-bots/:id`
- `POST http://localhost:3001/auth/register`, `POST /auth/2fa/verify-setup`,
  `POST /auth/login` (ver sección de autenticación abajo)

**`/paper-bots/*` requiere autenticación** (`Authorization: Bearer <jwt>`,
obtenido de `/auth/login`); el resto de los endpoints sigue público en esta
fase.

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
- `http://localhost:3000/paper-bots` — Mis Bots / Paper Trading (Fase 4):
  crear bots (activo, umbrales, capital virtual, kill switch), lista con
  badge "MODO SIMULADO" siempre visible, P&L y estado, gráfico de evolución
  del portfolio virtual y log de operaciones por bot. **Requiere sesión
  iniciada** — redirige a `/login` si no hay una.
- `http://localhost:3000/register` y `http://localhost:3000/login` (Fase
  4.5): alta de cuenta con setup de 2FA obligatorio (QR + código de la app
  de autenticación) e inicio de sesión con email + contraseña + código

Las secciones 0-3 de arriba son para **desarrollo local**: cada proceso
corre en una terminal con `--reload`/`start:dev`/`npm run dev`, no
sobreviven un reinicio ni se recuperan solos de un crash. Para dejar el
paper trading corriendo varios días sin supervisión, seguí la sección
siguiente en su lugar.

## Correr todo en un servidor/VPS con Docker Compose (para dejarlo corriendo varios días)

Esto dockeriza los 5 servicios (Postgres, Redis, bot-engine, el worker de
Celery, backend y frontend) con `restart: unless-stopped` — si un proceso
crashea, Docker lo reinicia solo. Es lo que conviene usar para la prueba de
paper trading de varios días que hablamos, en vez de terminales sueltas.

### Setup (una sola vez)

```bash
git clone <este repo> && cd gpa-academy1
cp .env.example .env
```

Editar `.env` y completar:
- `BINANCE_TESTNET_API_KEY` / `BINANCE_TESTNET_API_SECRET` (de
  [testnet.binance.vision](https://testnet.binance.vision/))
- `JWT_SECRET` y `NEXTAUTH_SECRET` — generar dos valores distintos, ej.
  `openssl rand -base64 32` cada uno. **`docker compose up` falla a
  propósito si quedan vacíos**, para no arrancar con secretos por defecto.
- `PUBLIC_BACKEND_URL` / `PUBLIC_FRONTEND_URL` — si el servidor tiene una IP
  pública fija (ej. `203.0.113.10`), poné `http://203.0.113.10:3001` y
  `http://203.0.113.10:3000`. Esta URL queda **inlineada en el build del
  frontend** (Next.js la necesita en build time, no en runtime): si la
  cambiás después, hay que reconstruir la imagen del frontend
  (`docker compose build frontend`).

### Levantar todo

```bash
docker compose up -d --build
docker compose ps          # las 5 deberian terminar "healthy" o "running"
```

### Crear tu cuenta y el primer bot

Con todo arriba, entrá a `http://<tu-servidor>:3000/register`, completá el
setup de 2FA, logueate, y creá uno o dos bots desde `/paper-bots`. A partir
de ahí el worker de Celery los va a evaluar solo, sin que hagas nada más.

### Qué revisar cada tanto durante la prueba de varios días

- `docker compose ps` — que los 5 servicios sigan arriba (si alguno
  reinició muchas veces, `docker compose logs <servicio>` para ver por qué).
- `docker compose logs -f celery-worker` — ahí se ve cada evaluación y cada
  operación simulada que ejecuta un bot.
- En `/paper-bots`: P&L de cada bot, y que ninguno haya quedado en
  `stopped_kill_switch` sin que lo hayas notado (si pasó, revisá su log de
  operaciones para entender la caída de drawdown).
- `GET /signal-history/{symbol}` en el backend: a medida que pasen las 24h+,
  las señales van quedando marcadas `correct`/`incorrect` — es un buen
  indicador temprano de si el motor de señales le está acertando o no en
  este período.

### Actualizar código sin perder los datos

```bash
git pull
docker compose up -d --build   # reconstruye solo lo que cambio, Postgres/Redis no se tocan
```

El volumen `tradinghub_postgres_data` persiste entre reinicios y rebuilds;
solo se pierde con `docker compose down -v` (evitar ese `-v` a menos que
quieras arrancar de cero).

## Variables de entorno

| Servicio    | Variable                       | Descripción                                        |
|-------------|---------------------------------|-----------------------------------------------------|
| bot-engine  | `BINANCE_TESTNET_API_KEY`      | API key de Binance **testnet**                      |
| bot-engine  | `BINANCE_TESTNET_API_SECRET`   | API secret de Binance **testnet**                   |
| bot-engine  | `DATABASE_URL`                 | Conexión a Postgres (paper trading)                  |
| bot-engine  | `CELERY_BROKER_URL`            | Redis usado como broker de Celery (índice `/1`)      |
| bot-engine  | `PAPER_BOT_TICK_SECONDS`       | Cada cuántos segundos Celery Beat revisa bots vencidos |
| backend     | `BOT_ENGINE_URL`               | URL del servicio bot-engine                          |
| backend     | `PORT`                         | Puerto del backend (default `3001`)                  |
| backend     | `REDIS_URL`                    | Conexión a Redis (cache de señales)                  |
| backend     | `SIGNAL_CACHE_TTL_SECONDS`     | TTL del cache de señales, 1-5 min recomendado        |
| backend     | `DATABASE_URL`                 | Conexión a Postgres (histórico de señales)           |
| backend     | `JWT_SECRET`                   | Secreto para firmar el JWT propio del backend        |
| backend     | `JWT_EXPIRES_IN`               | Vigencia del JWT (default `2h`)                      |
| frontend    | `NEXT_PUBLIC_BACKEND_URL`      | URL del backend NestJS                               |
| frontend    | `NEXTAUTH_SECRET`              | Secreto de NextAuth (independiente del `JWT_SECRET`) |
| frontend    | `NEXTAUTH_URL`                 | URL pública del frontend (`http://localhost:3000`)   |

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

## Paper trading (Fase 4)

Cada bot (`bot-engine/app/paper_trading/`) mantiene un portfolio virtual
independiente en Postgres (`paper_bots`, `paper_trades`, `paper_bot_events`,
`paper_bot_equity_snapshots`). Un tick de Celery Beat corre cada minuto
(configurable) y evalúa solo los bots cuyo propio `evaluation_interval_minutes`
ya venció desde su última evaluación — así cada bot puede tener un intervalo
distinto sin necesitar un scheduler dinámico por bot.

En cada evaluación, el bot llama al **mismo** motor de señales de la Fase 2
(`build_signal`, en vivo contra Binance testnet — nunca histórico) y aplica
las mismas constantes de comisión (0.1%) y slippage (0.05%) ya validadas en
el backtest de la Fase 3, para que el comportamiento simulado sea consistente
con lo que el usuario probó antes de crear el bot.

**Kill switch**: en cada tick se actualiza el punto más alto de equity
(`high_water_mark`) del bot; si el equity actual cae más de `kill_switch_pct`
desde ese pico, el bot pasa a `stopped_kill_switch`, deja de operar
automáticamente, y queda un `PaperBotEvent` registrado (la notificación de
esta fase es solo un registro en base de datos, sin email todavía).

Cada bot pertenece a un usuario real (ver Fase 4.5 abajo): el bot-engine no
valida JWT, pero filtra siempre por `user_id` en cada consulta — pedir el
bot de otra persona devuelve 404 (nunca 403, para no confirmar que existe).

**Ninguna API key de trading real existe en este código.** El bot-engine solo
usa el cliente de Binance testnet (mismas credenciales de solo-lectura de
las Fases 1-2) para leer precios en vivo; no hay ningún camino de código que
permita crear órdenes reales ni conectar una cuenta real de exchange — eso
es explícitamente Fase 5. Cada respuesta de `/paper-bots` incluye un
`disclaimer` recordando que es modo simulado, y el frontend muestra un badge
"MODO SIMULADO — Sin dinero real" de forma permanente en cada bot.

## Autenticación con 2FA obligatorio (Fase 4.5)

Se insertó esta fase antes de la Fase 5 (ejecución real) porque conectar
dinero real sobre una API sin autenticación habría expuesto ese dinero a
cualquiera con la URL. El 2FA es obligatorio: no existe una cuenta "a medio
configurar" que pueda loguearse sin TOTP.

**Cómo se conectan los tres servicios**: NestJS (`backend/src/auth/`) es la
única fuente de verdad de usuarios (tabla `users` en Postgres — email,
`passwordHash` con bcrypt, `totpSecret`, `twoFactorEnabled`) y emite su
propio JWT (`passport-jwt`) al loguearse. NextAuth.js, en el frontend, no
valida nada por sí mismo: su Credentials provider llama a `POST /auth/login`
y, si el backend acepta, envuelve ese JWT dentro de la sesión de NextAuth
(evitando así tener que descifrar el JWE interno de NextAuth desde Nest). El
frontend reenvía ese JWT como `Authorization: Bearer` en cada llamada a
`/paper-bots`; NestJS lo valida con su propio `JwtAuthGuard` y extrae el
`userId`, que reenvía al bot-engine vía el header interno `X-User-Id` (el
bot-engine confía en que solo el backend le habla — no debería quedar
expuesto directo a internet).

Flujo de una cuenta nueva:
1. `POST /auth/register` (email + password) → crea el usuario **sin
   habilitar** y devuelve un QR (`qrCodeDataUrl`) + el secreto en texto
   (`manualEntryCode`) para cargar en Google Authenticator/Authy.
2. `POST /auth/2fa/verify-setup` (userId + código de 6 dígitos) → recién acá
   `twoFactorEnabled` pasa a `true`. Sin este paso, el login siempre falla.
3. `POST /auth/login` (email + password + código) → valida los tres datos y
   devuelve el JWT. Cualquier fallo (usuario inexistente, 2FA sin terminar,
   password o código incorrectos) responde el mismo mensaje genérico, para
   no filtrar por enumeración cuál de los tres falló.

**Límite conocido, no escondido**: no hay códigos de respaldo. Si alguien
pierde su app de autenticación, pierde el acceso a la cuenta — quedaría para
una fase de hardening posterior.

## Notas de seguridad y alcance de esta fase

- Todo el tráfico de mercado en vivo (`/market`, `/signals`) va contra
  `testnet.binance.vision` (`exchange.set_sandbox_mode(True)` en
  `bot-engine/app/exchange.py`). Solo `/backtest` usa Binance mainnet, y
  exclusivamente para leer velas históricas (sin API keys).
- No hay ejecución de órdenes reales en ningún endpoint, ni siquiera en los
  bots de paper trading: solo se leen ticker, velas históricas, se calculan
  indicadores/señales y se simulan estrategias sobre un portfolio virtual.
- Cada respuesta de mercado, de señales, de backtest y de paper trading
  incluye un `disclaimer` en el JSON (no solo en el frontend) recordando que
  los datos son informativos, que el paper trading es simulado, y que nada
  de esto constituye asesoría financiera ni garantía de resultados.
- Los archivos `.env` están en `.gitignore`; usar los `*.env.example` como
  plantilla.
- `/paper-bots/*` exige JWT válido; el resto de los endpoints (`/market`,
  `/signals`, `/backtest`) sigue público porque no maneja estado mutable por
  usuario — evaluar si conviene protegerlos también antes de exponer esto
  fuera de un entorno privado.

## Próximas fases (fuera de alcance aquí)

Ejecución de órdenes reales (Fase 5, con límites de tamaño de orden y
controles de riesgo todavía por definir), códigos de respaldo para 2FA,
reporte visual de precisión histórica de señales y de backtests pasados, y
diseño visual definitivo se abordarán en fases posteriores. La recomendación
operativa es correr los bots de paper trading por varios días/semanas de
datos reales antes de considerar ejecución real.
