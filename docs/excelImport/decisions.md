# Decisiones técnicas — Excel Import

## [2026-07-25] Validación en Cliente con SheetJS antes del Envío al Backend
**Decisión**: Usar `xlsx` (SheetJS) directamente en el browser para parsear y validar archivos Excel antes de enviarlos a la API.
**Motivo**: Evitar que archivos inválidos o mal formateados saturen el backend con peticiones HTTP fallidas, mejorando la experiencia de usuario con feedback inmediato.
**Trade-off**: El tamaño del bundle del cliente crece por la dependencia de `xlsx`, mitigado parcialmente con importación asíncrona.

## [2026-09-15] Soporte de Formato XLSB para Archivos SIAD
**Decisión**: Incluir soporte explícito para el formato `.xlsb` (Excel Binary Workbook) utilizado en los reportes SIAD de CFE.
**Motivo**: Los archivos SIAD exportados por los sistemas internos de CFE son en formato binario `.xlsb` y no pueden leerse con parsers estándar de `.xlsx`.
**Trade-off**: SheetJS soporta `.xlsb` pero la lectura puede ser más lenta en archivos de gran tamaño.

