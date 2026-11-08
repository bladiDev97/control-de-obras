# Decisiones técnicas — Asignación

## [2026-10-01] Reasignación con Notificación Dual
**Decisión**: Al reasignar una obra, enviar correo al contratista anterior notificando la reasignación y al nuevo contratista con los datos de la obra.
**Motivo**: Mantener la transparencia del proceso y la trazabilidad de cambios de responsabilidad en las obras.
**Trade-off**: Depende de que los datos de correo del contratista estén registrados y sean válidos en el sistema.

## [2026-10-15] Botón de Reasignación en la Vista de Obras
**Decisión**: Incluir un botón de reasignación directamente en la tabla de obras (dentro del modal de edición) accesible solo para usuarios con rol de administrador o supervisor.
**Motivo**: Facilitar el flujo operativo de reasignación sin salir del contexto de la tabla de obras.
**Trade-off**: Incrementa la responsabilidad del control de acceso basado en roles en el frontend.

## [2026-10-20] Preservación del Plano Técnico en Reasignación
**Decisión**: Al reasignar una obra, preservar y adjuntar el plano técnico existente en el nuevo oficio de asignación generado.
**Motivo**: El plano técnico es parte del expediente de la obra independientemente del contratista asignado.
**Trade-off**: Ninguno significativo.
