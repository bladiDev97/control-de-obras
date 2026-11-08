# Contexto actual — Contratos

Última actualización: 2026-11-08

## Estado general
Implementado a nivel de entidades, repositorios y servicios con endpoints básicos expuestos en `ContratoController`.

## Qué está implementado
- [x] Entidades `ContratoEntity`, `AsignacionEntity`, `EstimacionEntity` mapeadas en TypeDORM.
- [x] Repositorio `ContratoRepository` extendiendo `TypeDORMRepository`.
- [x] Creación, actualización y consulta de contratos.
- [x] Registro y vinculación de asignaciones y estimaciones.

## Qué falta implementar
- [ ] Pruebas unitarias para `ContratoService` y validación de montos acumulados de estimaciones.
- [ ] Reportes analíticos de consumo presupuestal por contrato.

## Decisiones pendientes
- Definir si las estimaciones generan notificaciones automáticas vía WhatsApp/email a los contratistas.

## Notas para la próxima sesión
- Revisar la sincronización entre `ContratoEntity` y los campos calculados de la obra (`numeroEstimacion`, `importeEstimacion`).

