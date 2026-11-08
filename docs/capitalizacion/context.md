# Contexto actual — Capitalización

Última actualización: 2026-11-08

## Estado general
Implementado en `src/modules/capitalizacion/` y `backend/src/obras/domain/services/obra.service.ts`. Permite revisar y registrar expedientes listos para capitalizar con filtros por año y circuito, y cálculo estricto de días sin capitalizar sobre la Fecha de Término.

## Qué está implementado
- [x] Vista principal `CapitalizacionPage.tsx` con tabla de obras terminadas pendientes de capitalizar.
- [x] Filtros por año fiscal, zona y estado de integración contable.
- [x] Registro de fecha de capitalización desde la vista.
- [x] Integración con `ReusableTable` para consistencia con el módulo de obras.
- [x] Cálculo de `diasSinCapitalizar` condicionado exclusivamente a la existencia de Fecha de Término (`fechaFinConstruccion`), omitiendo `fechaTerminoCampo` para el conteo de rezago.

## Qué falta implementar
- [ ] Exportación consolidada de expedientes por ejercicio fiscal para auditoría contable.
- [ ] Validación visual del porcentaje de expedientes capitalizados vs. pendientes por zona.

## Decisiones pendientes
- Ninguna bloqueante por el momento.

## Notas para la próxima sesión
- `calculateDaysSinceTermino` usa `parseDateToTimestamp` para soportar de manera robusta tanto fechas ISO como DD/MM/YYYY.

