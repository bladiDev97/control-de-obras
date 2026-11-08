# Contexto actual — Personal

Última actualización: 2026-11-08

## Estado general
Estable y funcional. Cuenta con endpoints REST completos en `PersonalController` y 3 registros activos en la base de datos de producción/seed.

## Qué está implementado
- [x] CRUD completo de personal (`getAll`, `getOne`, `create`, `update`, `delete`).
- [x] Entidad `PersonalEntity` y mapeo TypeDORM.
- [x] Repositorio `PersonalRepository` con filtrado por borrado lógico.

## Qué falta implementar
- [ ] Pruebas unitarias en `personal.service.spec.ts`.
- [ ] Sincronización automática de perfil con el módulo de `auth` cuando un usuario del sistema es a la vez residente de obra.

## Decisiones pendientes
- Evaluar si se añade autenticación directa a la app móvil para que el personal registre avances directamente en campo.

## Notas para la próxima sesión
- La entidad `PersonalEntity` utiliza `GenericEntity` como base; verificar siempre que los endpoints excluyan registros marcados con `isDelete: true`.

