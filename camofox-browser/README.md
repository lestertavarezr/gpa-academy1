# camofox-browser

Navegador headless stealth para agentes de IA, basado en [Camoufox](https://camoufox.com/)
(fork de Firefox con spoofing de fingerprint a nivel de motor). Expone una API REST
pensada para automatización de agentes: referencias estables de elementos,
snapshots de accesibilidad y aislamiento de sesión.

- Repo original: https://github.com/jo-inc/camofox-browser
- Paquete npm: [`@askjo/camofox-browser`](https://www.npmjs.com/package/@askjo/camofox-browser)

> Nota: este proyecto **no** distribuye un "Skill" de Claude Code (no incluye
> `SKILL.md`). Es un servidor/paquete npm independiente, con un plugin opcional
> para el framework OpenClaw. Aquí se documenta cómo instalarlo y usarlo.

## Uso previsto en este repositorio

Automatización/scraping de sitios propios de GPA Academy (por ejemplo, pruebas
end-to-end o extracción de datos de nuestras propias páginas). No usar para
evadir controles de sitios de terceros sin autorización.

## Instalación

```bash
bash setup.sh
```

O manualmente:

```bash
npm install @askjo/camofox-browser
npx @askjo/camofox-browser   # levanta el servidor en el puerto 9377
```

Instalación alternativa vía Docker (`make up`) o desde el código fuente: ver el
[README del repo original](https://github.com/jo-inc/camofox-browser).

## Uso

Con el servidor corriendo, la API REST queda disponible en `http://localhost:9377`,
con documentación interactiva en `/docs` y el esquema en `/openapi.json`.

Integración con OpenClaw (opcional):

```bash
openclaw plugins install @askjo/camofox-browser
```
