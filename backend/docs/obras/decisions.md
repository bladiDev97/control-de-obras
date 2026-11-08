# Decisiones técnicas — Obras

## [2026-08-24] Almacenamiento de Planos en AWS S3
**Decisión**: Mover el almacenamiento de planos PDF desde el sistema de archivos local (`uploads/`) directamente hacia AWS S3 con streaming vía endpoint proxy `/obras/plano-view`.
**Motivo**: Compatibilidad con el entorno Serverless AWS Lambda, el cual cuenta con sistema de archivos efímero y de solo lectura fuera de `/tmp`.
**Trade-off**: Dependencia de conectividad con el bucket S3 y necesidad de credenciales o permisos IAM adecuados.

## [2026-09-04] Bloqueos en Memoria para Resecuenciación de Consecutivos
**Decisión**: Implementar `resequenceLocks` utilizando un `Map<string, Promise<IObra[]>>` en `ObraService`.
**Motivo**: Prevenir condiciones de carrera al resecuenciar consecutivos de oficios concurrentemente en una misma instancia.
**Trade-off**: Solo sincroniza peticiones concurrentes dentro de la misma instancia de ejecución; en concurrencia extrema multi-instancia de Lambda requiere mecanismos adicionales como bloqueos distribuidos o transacciones DynamoDB.

