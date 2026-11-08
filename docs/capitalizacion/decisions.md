# Decisiones técnicas — Capitalización

## [2026-10-01] Filtros Específicos por Año Fiscal y Circuito
**Decisión**: Implementar filtros combinados por año fiscal y circuito/zona en la vista de capitalización.
**Motivo**: Facilitar el proceso de cierre de ejercicio contable, donde los equipos financieros necesitan agrupar expedientes por periodo y área operativa.
**Trade-off**: Incrementa la complejidad del estado de filtros en el componente pero mejora significativamente la experiencia de usuario en épocas de cierre.

## [2026-11-08] Uso de ReusableTable en la Vista de Capitalización
**Decisión**: Migrar la tabla de capitalización al componente compartido `ReusableTable` para alinear la experiencia visual con el módulo de obras.
**Motivo**: Garantizar consistencia visual y reducir la duplicación de lógica de filtrado y presentación tabular.
**Trade-off**: Requiere mapeo de columnas y configuración de props específicas del módulo.
