# Contexto actual — Obras

Última actualización: 2026-11-08

## Estado general
Completamente operativo y funcional. Es el módulo central del backend con 159 registros en la base de datos de producción/seed.

## Qué está implementado
- [x] CRUD completo de obras vía endpoints HTTP en `ObraController`.
- [x] Lógica de determinación automática de estados (`PENDIENTE`, `ASIGNADA`, `TERMINADA`, etc.).
- [x] Gestión de oficios y consecutivos (`auditConsecutivos`, `resequenceConsecutivos`).
- [x] Subida y visualización por proxy de planos PDF en S3 (`/obras/plano-view`).
- [x] Importación masiva de expedientes de obras (`importarObras`).
- [x] Normalización tolerante de fechas (`parseDateToTimestamp`).

## Qué falta implementar
- [ ] Pruebas unitarias completas en `obra.service.spec.ts` para cubrir casos borde de fechas y resecuenciación.
- [ ] Bloqueo distribuido en DynamoDB para transacciones atómicas de consecutivos entre múltiples lambdas.

## Decisiones pendientes
- Evaluar migración de `resequenceLocks` a DynamoDB TransactWrite o locking con TTL para entornos con alto tráfico concurrente.

## Notas para la próxima sesión
- El método `ObraService.parseDateToTimestamp` es crítico para todos los ordenamientos por fecha; cualquier cambio debe respetar compatibilidad con formatos `DD/MM/YYYY` y `YYYY-MM-DD`.

