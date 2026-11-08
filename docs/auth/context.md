# Contexto actual — Auth

Última actualización: 2026-11-08

## Estado general
Completamente operativo y funcional. Expone endpoints de login, registro, perfil y recuperación de contraseña en `AuthController`.

## Qué está implementado
- [x] Flujo de autenticación con JWT (`AuthService`, `JwtService`).
- [x] Hashing seguro de contraseñas con `bcryptjs` (10 rounds).
- [x] Entidad `UserEntity` y repositorio `UserRepository` con llave cifrada.
- [x] Validaciones de DTOs (`LoginDto`, `RegisterDto`, `UpdateUserDto`).
- [x] Guards JWT integrados en rutas protegidas del sistema.

## Qué falta implementar
- [ ] Pruebas unitarias en `auth.service.spec.ts`.
- [ ] Implementación de Refresh Tokens para rotación segura de sesiones.
- [ ] Decoradores RBAC granulares basados en roles/permisos específicos por acción en obras.

## Decisiones pendientes
- Evaluar la implementación de autenticación multifactor (MFA) para usuarios administradores.

## Notas para la próxima sesión
- El `CryptoService.encryptEmail` es el punto de entrada para toda búsqueda de usuario por email; cualquier cambio en su algoritmo requiere migración de llaves en DynamoDB.
