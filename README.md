# GPA Academy — Landing Page

Landing page premium para GPA Academy (Next.js App Router + Tailwind CSS +
Framer Motion), con identidad visual "JARVIS" y conversión de moneda
automática por geolocalización.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completa tus variables reales
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Ver `.env.example` para la lista completa. Resumen:

- `GEOLOCATION_API_URL` / `GEOLOCATION_API_KEY` — servidor, usado por
  `app/api/geo` para detectar el país del visitante (nunca se expone al
  cliente).
- `EXCHANGE_RATE_API_URL` / `EXCHANGE_RATE_API_KEY` — servidor, usado por
  `app/api/exchange-rate` para obtener tasas de cambio en tiempo real.
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — número del botón flotante de WhatsApp.
- `NEXT_PUBLIC_GOOGLE_FORM_ID_*` — un ID de Google Form por programa para
  el formulario embebido.
- `NEXT_PUBLIC_PAGADITO_URL_*` — un enlace de pago de Pagadito por
  programa.

Si `GEOLOCATION_API_KEY` o `EXCHANGE_RATE_API_KEY` no están configuradas, o
las llamadas fallan, el sitio recurre automáticamente a tasas de cambio
hardcodeadas (`lib/currency.ts`) y muestra precios en USD por defecto —
nunca se queda sin mostrar un precio.

Si un `NEXT_PUBLIC_GOOGLE_FORM_ID_*` o `NEXT_PUBLIC_PAGADITO_URL_*` no está
configurado, la sección de inscripción muestra un formulario nativo de
respaldo y un botón de Pagadito deshabilitado con una nota indicando qué
variable falta, en vez de romper la página.

## Estructura

- `app/page.tsx` — ensambla todas las secciones de la landing.
- `components/ProgramDetail.tsx` — sección completa por programa (dolor,
  beneficios, oferta, bonos, formulario + pago).
- `data/programs.ts` — contenido de los 4 programas.
- `lib/useLocalizedCurrency.ts` — hook cliente con cache en localStorage
  (6 horas) para geolocalización + tasa de cambio.

## Notas

- Las imágenes de las tarjetas de programa son placeholders visuales
  (gradiente + icono). Sustituir por fotografía real en `/public/images`
  y actualizar `components/ProgramVisual.tsx`.
- Los testimonios en `components/Testimonials.tsx` son contenido de
  muestra — reemplazar por testimonios reales antes de publicar.
