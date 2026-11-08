# Decisiones técnicas — Mapa

## [2026-07-15] Uso de Leaflet + react-leaflet
**Decisión**: Usar `leaflet` y el adaptador `react-leaflet` para renderizar el mapa interactivo.
**Motivo**: Librería de código abierto sin dependencia de APIs externas de pago, con soporte sólido para React y amplia comunidad.
**Trade-off**: Requiere importación explícita del CSS de Leaflet (`leaflet/dist/leaflet.css`) y corrección manual de los assets de iconos en el contexto de Vite.

## [2026-09-20] Renderizado de Marcadores por Estado
**Decisión**: Colorear los marcadores de obras en el mapa según el estado (`PENDIENTE`, `ASIGNADA`, `TERMINADA`, etc.) mediante íconos customizados de Leaflet.
**Motivo**: Facilitar la identificación visual rápida del estado operativo territorial a los supervisores.
**Trade-off**: Requiere mantenimiento de los assets de íconos SVG o PNG por cada estado posible.
