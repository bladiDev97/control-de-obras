# Contexto actual — Capitalización

Última actualización: 2026-11-08

## Estado general
Implementado en `src/modules/capitalizacion/`. Permite revisar y registrar expedientes listos para capitalizar con filtros por año y circuito.

## Qué está implementado
- [x] Vista principal `CapitalizacionPage.tsx` con tabla de obras terminadas pendientes de capitalizar.
- [x] Filtros por año fiscal, zona y estado de integración contable.
- [x] Registro de fecha de capitalización desde la vista.
- [x] Integración con `ReusableTable` para consistencia con el módulo de obras.

## Qué falta implementar
- [ ] Exportación consolidada de expedientes por ejercicio fiscal para auditoría contable.
- [ ] Validación visual del porcentaje de expedientes capitalizados vs. pendientes por zona.

## Decisiones pendientes
- Ninguna bloqueante por el momento.

