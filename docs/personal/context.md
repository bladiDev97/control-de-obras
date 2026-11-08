# Contexto actual — Personal

Última actualización: 2026-11-08

## Estado general
Estable y funcional en backend y frontend. Cuenta con endpoints REST completos y vista de gestión en el panel de administración.

## Qué está implementado
- [x] CRUD completo de personal en `PersonalController` (`getAll`, `getOne`, `create`, `update`, `delete` lógico).
- [x] Entidad `PersonalEntity` y mapeo TypeDORM con borrado lógico (`isDelete`).
- [x] Repositorio `PersonalRepository` con filtrado por borrado lógico.
- [x] Interfaz frontend en `src/modules/personal/` con tabla de gestión y formularios de captura.

## Qué falta implementar
- [ ] Pruebas unitarias en `personal.service.spec.ts`.
- [ ] Vista de carga de trabajo por supervisor/residente (cuántas obras activas tienen asignadas).
- [ ] Sincronización automática de perfil con el módulo de `auth` cuando un miembro del personal también sea usuario del sistema.

## Decisiones pendientes
- Evaluar si el personal de campo puede registrar avances directamente desde una app móvil con autenticación propia.

## Notas para la próxima sesión
- Los selectores de personal en los formularios de asignación de obras deben excluir registros con `isDelete: true`.
