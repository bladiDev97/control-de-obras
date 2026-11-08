# Decisiones técnicas — Zonas

## [2026-07-18] Mapeo de Zonas en Single-Table
**Decisión**: Persistir `ZonaEntity` en la tabla común `ControlDeObras` con `pk` = `ZONA#<id>` y `sk` = `metadata`.
**Motivo**: Mantener uniformidad con la arquitectura Single-Table de DynamoDB y facilitar cargas rápidas en cachés o combos de frontend.
**Trade-off**: Ninguno significativo dado el bajo volumen de registros de zonas.

