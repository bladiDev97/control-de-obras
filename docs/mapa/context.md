# Contexto actual — Mapa

Última actualización: 2026-11-08

## Estado general
Implementado en `src/modules/mapa/`. Presenta el mapa base con marcadores de las obras que disponen de coordenadas georreferenciadas.

## Qué está implementado
- [x] Mapa base con `react-leaflet` y marcadores interactivos por obra.
- [x] Popups con información resumida de cada obra (nombre, estado, contratista, zona).
- [x] Filtros de visualización por estado y zona.

## Qué falta implementar
- [ ] Clustering de marcadores para alta densidad de obras en viewport reducido.
- [ ] Polígonos o centroides de zona para delimitación territorial.
- [ ] Integración de coordenadas de circuitos eléctricos MT extraídos de bases MDB.

## Decisiones pendientes
- Evaluar el uso de `react-leaflet-cluster` para agrupamiento automático de marcadores.

## Notas para la próxima sesión
- Verificar que el CSS de Leaflet esté importado en el punto de entrada del módulo para evitar marcadores rotos tras build de Vite.

