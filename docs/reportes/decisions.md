# Decisiones técnicas — Reportes

## [2026-07-20] Generación de Reportes en Cliente vía Impresión CSS
**Decisión**: Implementar reportes imprimibles directamente en el cliente con CSS `@media print` y la función `window.print()`, sin generar PDF en servidor.
**Motivo**: Simplicidad de implementación y eliminación de dependencias de librerías de generación PDF en el backend serverless.
**Trade-off**: El control de paginación y fidelidad del formato queda sujeto a las capacidades de impresión del navegador.

## [2026-09-10] Exportación de Datos en Excel con SheetJS
**Decisión**: Usar la librería `xlsx` (SheetJS) en cliente para exportar reportes tabulares en formato `.xlsx`.
**Motivo**: Permite al personal administrativo manipular los datos exportados sin herramientas adicionales.
**Trade-off**: El tamaño del bundle del cliente aumenta por la dependencia de `xlsx`, mitigado por la carga asíncrona del módulo.

