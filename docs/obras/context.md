# Contexto actual — Obras

Última actualización: 2026-11-08

## Estado general
Completamente operativo y funcional tanto en backend como en frontend. Es el módulo nuclear del sistema, gestionando expedientes con almacenamiento en DynamoDB, visualización en Material UI y carga de planos en S3.

## Qué está implementado
- [x] CRUD completo de obras vía endpoints HTTP en `ObraController`.
- [x] Lógica de determinación automática de estados (`PENDIENTE`, `ASIGNADA`, `TERMINADA`, `CAPITALIZADA`).
- [x] Gestión, auditoría y resecuenciación de oficios consecutivos.
- [x] Subida y visualización por proxy de planos técnicos PDF en S3 (`/obras/plano-view`).
- [x] Importación masiva de expedientes de obras (`importarObras`).
- [x] Normalización tolerante de formatos de fechas (`DD/MM/YYYY`, `YYYY-MM-DD`).
- [x] Interfaz de usuario con tabla reutilizable, filtros avanzados, modal de edición y subida de planos.

## Qué falta implementar
- [ ] Pruebas unitarias completas en `obra.service.spec.ts` y componentes frontend con Vitest.
- [ ] Bloqueo distribuido o transacciones atómicas DynamoDB para emisión de consecutivos multi-lambda.

## Decisiones pendientes
- Evaluar la transición de `resequenceLocks` a DynamoDB TransactWrite para alta concurrencia serverless.

## Notas para la próxima sesión
- `ObraService.parseDateToTimestamp` es crítico para todos los ordenamientos cronológicos del sistema; cualquier modificación debe preservar compatibilidad con formatos de fechas existentes.

