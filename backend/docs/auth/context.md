# Contexto actual — Auth

Última actualización: 2026-11-08

## Estado general
Completamente operativo y funcional. Expone endpoints de login, registro, perfil y recuperación de contraseña en `AuthController`.

## Qué está implementado
- [x] Flujo de autenticación con JWT (`AuthService`, `JwtService`).
- [x] Hashing seguro de contraseñas con `bcryptjs`.
- [x] Entidad `UserEntity` y repositorio `UserRepository`.
- [x] Validaciones de DTOs (`LoginDto`, `RegisterDto`, `UpdateUserDto`).

## Qué falta implementar
- [ ] Pruebas unitarias en `auth.service.spec.ts`.
- [ ] Implementación de Refresh Tokens para rotación segura de sesiones sin reconexión frecuente.
- [ ] Decoradores RBAC granulares basados en roles/permisos específicos por acción en obras.

## Decisiones pendientes
- Evaluar si se implementa autenticación Multifactor (MFA) para administradores.

## Notas para la próxima sesión
- `CryptoService.encryptEmail` se ejecuta automáticamente en `TypeDORMRepository.createItem` cuando `sk === 'profile'`.

