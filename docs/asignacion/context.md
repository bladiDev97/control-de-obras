# Contexto actual — Asignación

Última actualización: 2026-11-08

## Estado general
Implementado como parte del módulo de obras (`src/modules/obras/`) y en el backend (`ObraController`, `ObraService`). Incluye el flujo completo de asignación, reasignación y generación de oficio PDF.

## Qué está implementado
- [x] Asignación de obras con generación de oficio consecutivo auditado.
- [x] Reasignación de obras con soporte para contratistas y usuarios tipo ADMON.
- [x] Notificaciones por correo al contratista anterior y al nuevo en caso de reasignación.
- [x] Preservación del plano técnico existente en el nuevo oficio de asignación.
- [x] Estampado de firma digital del supervisor en el PDF del oficio.
- [x] Botón de reasignación en la vista de obras con validación de permisos.

## Qué falta implementar
- [ ] Integración de notificaciones de asignación por WhatsApp como alternativa al correo.
- [ ] Historial de reasignaciones por obra (trazabilidad de cambios de contratista).

## Decisiones pendientes
- Evaluar si el historial de reasignaciones debe almacenarse como entidad propia en DynamoDB o como log embebido en la obra.

## Notas para la próxima sesión
- El flujo de asignación pasa por `ObraService.asignarObra` → generación de PDF → subida a S3 → actualización de `planoPdf` en la entidad. Cualquier modificación al oficio PDF debe considerar este pipeline completo.
