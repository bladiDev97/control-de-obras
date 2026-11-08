# Reglas de Seguridad

## 1. Backend
- **Autenticación y Autorización**:
  - Rutas sensibles protegidas con Guards de NestJS basados en JWT (`JwtAuthGuard`).
  - Tokens JWT validados por expiración, firma y payload.
  - Contraseñas siempre cifradas con `bcrypt` (mínimo 10 rounds de sal). Nunca almacenar en texto plano.
- **Secretos y Cloud**:
  - Prohibido hardcodear llaves secretas (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`), secretos JWT o credenciales SMTP.
  - En local: usar variables en `.env`.
  - En AWS Lambda: inyectar vía Serverless Framework / SSM Parameter Store y roles IAM con principio de mínimo privilegio sobre la tabla DynamoDB y buckets S3.
  - Buckets de S3 privados: acceso a planos y documentos mediante URLs prefirmadas o proxies autenticados.

## 2. Frontend
- **Variables de Entorno**:
  - Ningún secreto ni credencial de producción en el cliente.
  - Solo variables con prefijo `VITE_` (e.g. `VITE_API_URL`) pueden exponerse en el build.
- **Procesamiento de Archivos**:
  - Validar tipos MIME y extensiones (`.xlsx`, `.xlsb`, `.csv`, `.pdf`) antes de procesar archivos locales o enviarlos a la API.
  - Sanitizar nombres de archivo y controlar excepciones ante libros de Excel corruptos o alterados.
- **Sesión**:
  - Tokens de autenticación transportados en encabezados `Authorization: Bearer <token>`.
  - Nunca registrar contraseñas, tokens o PII en `console.log`.

