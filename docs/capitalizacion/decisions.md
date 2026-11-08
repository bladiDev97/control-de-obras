# Decisiones técnicas — Capitalización

## [2026-10-01] Filtros Específicos por Año Fiscal y Circuito
**Decisión**: Implementar filtros combinados por año fiscal y circuito/zona en la vista de capitalización.
**Motivo**: Facilitar el proceso de cierre de ejercicio contable, donde los equipos financieros necesitan agrupar expedientes por periodo y área operativa.
**Trade-off**: Incrementa la complejidad del estado de filtros en el componente pero mejora significativamente la experiencia de usuario en épocas de cierre.

## [2026-11-08] Uso de ReusableTable en la Vista de Capitalización
**Decisión**: Migrar la tabla de capitalización al componente compartido `ReusableTable` para alinear la experiencia visual con el módulo de obras.
**Motivo**: Garantizar consistencia visual y reducir la duplicación de lógica de filtrado y presentación tabular.
**Trade-off**: Requiere mapeo de columnas y configuración de props específicas del módulo.

## [2026-11-08] Cálculo de Días sin Capitalizar Exclusivo por Fecha de Término
**Decisión**: Contar los días sin capitalizar únicamente si la obra cuenta con Fecha de Término oficial (`fechaFinConstruccion` / `fechaTermino`), excluyendo `fechaTerminoCampo`.
**Motivo**: La fecha de término en campo solo indica finalización de trabajos físicos en sitio, mientras que los días sin capitalizar miden el tiempo de rezago contable a partir de la fecha de término administrativo/oficial de la obra.
**Trade-off**: Las obras con solo fecha de término en campo se listan en capitalización pero no computan días de rezago ni activan alertas cromáticas de semáforo hasta contar con fecha de término oficial.

