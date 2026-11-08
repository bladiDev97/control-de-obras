# Módulo: Excel Import

## Propósito
Carga y procesamiento masivo de datos provenientes de plantillas Excel (`.xlsx`, `.xlsb`, `.csv`) del sistema: asignaciones, avance de contratos, formatos CFE (SIAD, SENASOL) y catálogos de obras. Permite la previsualización y validación previa antes de enviar al backend.

## Entradas
- Archivos locales seleccionados o arrastrados por el usuario en la interfaz.
- Formatos soportados: `.xlsx`, `.xlsb`, `.csv`.

## Salidas
- Previsualización tabular de las filas leídas y mapeadas.
- Detección y reporte de discrepancias o filas con errores de validación (número de fila y columna afectada).
- Envío confirmado de los datos validados hacia los endpoints API correspondientes.

## Reglas de negocio
1. Las extensiones y tipos MIME del archivo deben validarse antes de procesarlo.
2. Los encabezados de columna deben normalizarse (eliminar acentos, espacios, mayúsculas/minúsculas inconsistentes) antes del mapeo a objetos tipados.
3. Se debe presentar un resumen de validación al usuario antes de confirmar la importación definitiva.
4. Archivos corruptos o con hojas vacías deben ser rechazados con un mensaje de error claro.

