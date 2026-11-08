# Contexto actual — Contratos

Última actualización: 2026-11-08

## Estado general
Implementado tanto en backend (`ContratoController`, `ContratoService`, TypeDORM) como en frontend (`src/modules/contratos/`). Permite la gestión y consulta de contratos con visualización de montos y avance presupuestal.

## Qué está implementado
- [x] Entidades `ContratoEntity`, `AsignacionEntity`, `EstimacionEntity` en TypeDORM.
- [x] Repositorio `ContratoRepository` extendiendo `TypeDORMRepository`.
- [x] Endpoints para creación, actualización y consulta de contratos.
- [x] Registro y vinculación de asignaciones y estimaciones.
- [x] Interfaz frontend en `src/modules/contratos/` para listado y detalle de contratos.

## Qué falta implementar
- [ ] Pruebas unitarias para `ContratoService` y validaciones de topes financieros.
- [ ] Alertas visuales en frontend cuando un contrato supere el 90% del presupuesto adjudicado.
- [ ] Reportes consolidados de consumo financiero descargables en Excel.

## Decisiones pendientes
- Definir si el registro de nuevas estimaciones debe disparar alertas por correo o WhatsApp a los contratistas.

## Notas para la próxima sesión
- Revisar consistencia de los identificadores de contrato entre las plantillas de Excel cargadas y los registros persistidos.

