# Decisiones técnicas — Obras

## [2026-08-24] Almacenamiento de Planos en AWS S3
**Decisión**: Mover el almacenamiento de planos PDF desde el sistema de archivos local (`uploads/`) directamente hacia AWS S3 con streaming vía endpoint proxy `/obras/plano-view`.
**Motivo**: Compatibilidad con el entorno Serverless AWS Lambda, cuyo sistema de archivos es efímero y de solo lectura fuera de `/tmp`.
**Trade-off**: Dependencia de conectividad con el bucket S3 y necesidad de roles IAM adecuados.

## [2026-09-04] Bloqueos en Memoria para Resecuenciación de Consecutivos
**Decisión**: Implementar `resequenceLocks` utilizando un `Map<string, Promise<IObra[]>>` en `ObraService`.
**Motivo**: Prevenir condiciones de carrera al resecuenciar consecutivos de oficios concurrentemente en una misma instancia.
**Trade-off**: Solo sincroniza peticiones concurrentes dentro de la misma instancia de Lambda; para concurrencia extrema se evaluará DynamoDB TransactWrite o bloqueo distribuido.

## [2026-10-15] Desacoplamiento de Componentes y Tablas Reutilizables en Frontend
**Decisión**: Extraer la visualización tabular hacia `ReusableTable` con filtros configurables por columna y modales de edición desacoplados en `src/modules/obras/`.
**Motivo**: Mantener coherencia visual y comportamiento reactivo uniforme entre las vistas de Obras, Capitalización y Asignación.
**Trade-off**: Mayor número de props de configuración en componentes transversales.

