# Invitación de boda — Lester & Jhomayri

Sitio estático de una sola página (HTML/CSS/JS, sin dependencias de build).

## Ver localmente

```bash
cd boda-lester-jhomayri
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Publicar

Cualquier hosting estático sirve (GitHub Pages, Netlify, Vercel). Para GitHub Pages:
activa Pages en la configuración del repo apuntando a la carpeta `boda-lester-jhomayri/`
(o a la raíz si mueves los archivos), rama `claude/wedding-invitation-lester-jhomayri-85koyq`
o `main` una vez fusionada.

## Contenido incluido

- Sobre animado de bienvenida (toca para abrir la invitación).
- Cuenta regresiva en vivo hasta el 26/12/2026 4:00 PM.
- Itinerario: ceremonia (Santiago de los Caballeros) y recepción (Eventos Caminos de Santiago),
  cada uno con enlace a Google Maps.
- Código de vestimenta: formal, color negro.
- Confirmación de asistencia (RSVP) vía botones de WhatsApp directos a Jhomayri y Lester.
- Hashtag #LesterYJhomayri.

## Pendiente / editable

- **Fotos**: no se incluyeron fotos todavía. Se puede agregar una sección de galería o una
  foto de portada en `#hero` cuando las tengan listas.
- **Direcciones exactas**: los enlaces de mapa usan el nombre del lugar como búsqueda de texto
  en Google Maps. Si tienen la dirección exacta o el pin de ubicación, se puede reemplazar
  por un enlace directo más preciso.
- **Vestimenta**: se agregó la línea "evitar el color blanco" como convención estándar de
  bodas; si no aplica, se puede quitar fácilmente en `index.html` (sección `#dresscode`).
- **Mesa de regalos**: no se incluyó por falta de datos; se puede añadir una sección si la
  necesitan.
