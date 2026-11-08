# Contexto actual — Zonas

Última actualización: 2026-11-08

## Estado general
Completamente implementado y estable. Catálogo base configurado en la base de datos con endpoints operativos en `ZonasController` y selectores reactivos en frontend.

## Qué está implementado
- [x] Entidad `ZonaEntity` y repositorio `ZonasRepository` con TypeDORM.
- [x] Endpoints para listado y consulta de zonas en `ZonasController`.
- [x] Vinculación de obras a su zona correspondiente mediante el atributo `zona` en `IObra`.
- [x] Selectores de zona en formularios de obras, contratos y filtros en frontend.

## Qué falta implementar
- [ ] Pruebas unitarias en `zonas.service.spec.ts`.
- [ ] Coordenadas poligonales o centroides de zona para delimitación visual en el mapa interactivo.

## Decisiones pendientes
- Ninguna bloqueante por el momento.
