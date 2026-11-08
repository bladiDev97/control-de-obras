# Decisiones técnicas — Zonas

## [2026-07-18] Mapeo de Zonas en Single-Table
**Decisión**: Persistir `ZonaEntity` en la tabla común `ControlDeObras` con `pk: ZONA#<id>` y `sk: metadata`.
**Motivo**: Mantener uniformidad con el Single-Table Design de DynamoDB y facilitar cargas rápidas del catálogo en cachés o combos de frontend.
**Trade-off**: Ninguno significativo dado el bajo volumen de registros de zonas.

## [2026-09-18] Uso del Catálogo de Zonas como Filtro Transversal
**Decisión**: Las zonas se cargan como catálogo en los filtros de Obras, Contratos y en el Mapa Interactivo.
**Motivo**: Proporcionar segmentación geográfica consistente y reutilizable en todos los módulos del sistema.
**Trade-off**: El catálogo debe invalidarse o refrescarse si se agrega o modifica una zona durante la sesión activa.

