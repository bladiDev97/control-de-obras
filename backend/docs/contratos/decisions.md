# Decisiones técnicas — Contratos

## [2026-06-28] Modelado de Contratos, Asignaciones y Estimaciones en Single-Table
**Decisión**: Modelar Contrato, Asignacion y Estimacion como entidades TypeDORM separadas (`ContratoEntity`, `AsignacionEntity`, `EstimacionEntity`) pero residiendo en la misma tabla `ControlDeObras`.
**Motivo**: Mantener coherencia con el Single-Table Design y permitir joins lógicos o batch writes en una única conexión DynamoDB.
**Trade-off**: Complejidad en la definición de llaves compuestas `pk` y `sk` para evitar colisiones.

