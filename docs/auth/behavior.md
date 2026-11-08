# Módulo: Auth

## Propósito
Gestiona el ciclo de identidad de los usuarios del sistema: registro, autenticación mediante credenciales (email y contraseña), emisión y verificación de JSON Web Tokens (JWT), actualización de perfiles y restablecimiento de contraseña.

## Entradas
- Registro / Login: `LoginDto` (`email`, `password`), `RegisterDto` (`email`, `password`, `name`, `roles`).
- Actualización de perfil / clave: `UpdateUserDto`, `ResetPasswordDto`.

## Salidas
- Tokens de acceso JWT firmados (`accessToken`, `expiresIn`).
- Perfil del usuario autenticado sin incluir el hash de contraseña.

## Reglas de negocio
1. Las contraseñas deben cifrarse obligatoriamente con `bcrypt` (mínimo 10 rounds) antes de guardarse en base de datos.
2. El email es el identificador único del usuario en el sistema y es la partition key en DynamoDB.
3. Las peticiones a rutas protegidas deben portar el header `Authorization: Bearer <token>`.
4. Los tokens expirados o con firma inválida deben retornar HTTP 401 Unauthorized de forma inmediata.

