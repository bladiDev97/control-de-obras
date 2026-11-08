# Decisiones técnicas — Auth

## [2026-05-17] Manejo de Secretos JWT y Algoritmo de Firma
**Decisión**: Utilizar `jsonwebtoken` con clave secreta configurable vía variable de entorno `JWT_SECRET`.
**Motivo**: Simplicidad, compatibilidad estándar y ligereza para ejecución serverless sin sobrecoste de memoria en Lambda.
**Trade-off**: Es responsabilidad del entorno inyectar un secreto robusto en producción (`.env.production` / AWS SSM).

## [2026-05-17] Cifrado de Email como Partition Key
**Decisión**: La llave de partición en DynamoDB para usuarios utiliza hashing o sanitización vía `CryptoService.encryptEmail(pk)`.
**Motivo**: Proteger datos de identificación personal (PII) en la llave primaria de DynamoDB.
**Trade-off**: Cualquier consulta por email debe normalizar y cifrar la clave de búsqueda antes de consultar DynamoDB.

