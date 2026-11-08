# Decisiones técnicas — Personal

## [2026-07-08] Borrado Lógico en Entidades de Personal
**Decisión**: Emplear el atributo `isDelete: boolean` heredado de `GenericEntity` para bajas de personal en vez de borrado físico (`DeleteItem`).
**Motivo**: Mantener la integridad referencial histórica con obras terminadas o bitácoras firmadas por el residente.
**Trade-off**: Las consultas de personal activo deben incluir explícitamente el filtro de exclusión `isDelete !== true`.

