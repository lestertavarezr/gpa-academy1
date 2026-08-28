# camofox-browser

Navegador headless stealth para agentes de IA, basado en [Camoufox](https://camoufox.com/)
(fork de Firefox con spoofing de fingerprint a nivel de motor). Expone una API REST
pensada para automatización de agentes: referencias estables de elementos,
snapshots de accesibilidad y aislamiento de sesión. También incluye un servidor
**MCP** (`camofox-browser-mcp`) para conectarlo directamente a Claude Code.

- Repo original: https://github.com/jo-inc/camofox-browser
- Paquete npm: [`@askjo/camofox-browser`](https://www.npmjs.com/package/@askjo/camofox-browser)

## Uso previsto en este repositorio

Automatización/scraping de sitios propios de GPA Academy (por ejemplo, pruebas
end-to-end o extracción de datos de nuestras propias páginas). No usar para
evadir controles de sitios de terceros sin autorización.

## Instalación

```bash
bash setup.sh
```

Esto instala el paquete npm, descarga el binario de Camoufox (~300MB, una sola
vez) y expone el bin `camofox-browser-mcp` en el `PATH` vía `npm link`.

O manualmente:

```bash
npm install @askjo/camofox-browser
npx camoufox-js fetch                            # descarga el navegador
(cd node_modules/@askjo/camofox-browser && npm link)   # expone camofox-browser-mcp
```

Instalación alternativa vía Docker (`make up`) o desde el código fuente: ver el
[README del repo original](https://github.com/jo-inc/camofox-browser).

## Uso

### 1. Servidor REST

```bash
npx @askjo/camofox-browser   # levanta el servidor en el puerto 9377
```

- Docs interactivas: `http://localhost:9377/docs`
- Esquema OpenAPI: `http://localhost:9377/openapi.json`
- Salud: `http://localhost:9377/health`

### 2. MCP server para Claude Code

Con el servidor REST corriendo, registra el MCP server (una sola vez):

```bash
claude mcp add camofox-browser -s user -- camofox-browser-mcp
```

Verificar: `claude mcp list`, o `/mcp` dentro de una sesión de Claude Code.
Deberías ver 11 tools: `camofox_create_tab`, `camofox_snapshot`, `camofox_click`,
`camofox_type`, `camofox_navigate`, `camofox_scroll`, `camofox_screenshot`,
`camofox_evaluate`, `camofox_list_tabs`, `camofox_close_tab`,
`camofox_import_cookies`.

Integración con OpenClaw (opcional, alternativa a MCP):

```bash
openclaw plugins install @askjo/camofox-browser
```

## Verificación realizada

En este entorno se validó de extremo a extremo: `npm install` → servidor REST
respondiendo en `:9377` (`/health`, `/openapi.json`) → `npm link` → bin
`camofox-browser-mcp` resuelto en el `PATH` → `claude mcp add` → Claude Code
conectado al servidor MCP (`claude mcp list` → `Connected`).

La descarga del binario de Camoufox (`npx camoufox-js fetch`, ~300MB desde
GitHub Releases) **no se pudo completar en este sandbox** porque la política
de red del entorno bloquea `api.github.com`. Al ejecutar `setup.sh` en una
máquina sin esa restricción, ese paso debería completarse sin problema.
