# Decisiones técnicas — Contratos

## [2026-06-28] Modelado de Contratos, Asignaciones y Estimaciones en Single-Table
**Decisión**: Modelar Contrato, Asignacion y Estimacion como entidades TypeDORM separadas (`ContratoEntity`, `AsignacionEntity`, `EstimacionEntity`) dentro de la misma tabla DynamoDB `ControlDeObras`.
**Motivo**: Mantener uniformidad con la arquitectura Single-Table y permitir consultas conjuntas o escrituras atómicas en una sola conexión.
**Trade-off**: Manejo de llaves compuestas `pk` y `sk` para evitar colisiones entre estimaciones y contratos.

## [2026-09-12] Cálculo Dinámico del Avance Financiero
**Decisión**: Calcular el acumulado de estimaciones bajo demanda o mediante servicios reactivos en frontend, cruzando datos con las obras vinculadas.
**Motivo**: Evitar inconsistencias de sincronización de totales agregados ante eliminaciones o modificaciones de estimaciones.
**Trade-off**: Mayor cómputo en consultas que agrupan múltiples estimaciones.

