# Reglas de Seguridad

## 1. Autenticación y Autorización
- Toda ruta que exponga datos o mutaciones sensibles debe estar protegida con Guards de NestJS basados en JWT (`JwtAuthGuard` o similar).
- Los tokens JWT deben validarse verificando expiración, firma y payload (`userId`, roles, permisos).
- Prohibido almacenar contraseñas en texto plano: usar siempre `bcrypt` con un costo de sal apropiado (mínimo 10 rounds).

## 2. Gestión de Credenciales y Secretos
- NUNCA quemar (hardcodear) llaves secretas, tokens de AWS (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`), secretos JWT o contraseñas SMTP en el código fuente.
- En entorno local, utilizar variables cargadas desde `.env` o `.env.development`.
- En entorno cloud / Serverless Lambda:
  - Aprovechar roles IAM para conceder permisos mínimos necesarios sobre la tabla DynamoDB y los buckets S3.
  - Secretos como `JWT_SECRET` y credenciales de correo deben inyectarse mediante variables de entorno en el despliegue o AWS Systems Manager (SSM) Parameter Store / Secrets Manager.

## 3. Validación y Sanitización de Entradas
- Todos los endpoints de creación o actualización deben validar la carga útil (payload) a través de DTOs fuertemente tipados.
- Activar globalmente el `ValidationPipe` de NestJS con `{ whitelist: true, forbidNonWhitelisted: true }` para descartar cualquier propiedad no reconocida en las peticiones.
- Evitar inyecciones NoSQL o manipulaciones no autorizadas en parámetros de llaves `pk` y `sk` de DynamoDB.

## 4. Manipulación Segura de Archivos
- La carga de archivos (planos PDF, fotos, evidencias) debe validar tipos MIME estrictos (`application/pdf`, `image/jpeg`, `image/png`) y tamaños máximos permitidos antes de procesarlos.
- Subir directamente a S3 en buffers de memoria (`memoryStorage()`) o a través de URLs prefirmadas (pre-signed URLs), evitando escribir archivos temporales huérfanos en disco.
- Nunca permitir que rutas de archivos proporcionadas por el usuario puedan provocar ataques de Directory Traversal (`../`).

