---
name: excel-processing
description: Lectura asíncrona, validación de columnas, normalización y transformación de plantillas Excel (.xlsx, .xlsb, .csv) con SheetJS (xlsx).
---

# Skill: Excel Processing

## Cuándo se usa
Se utiliza cuando una tarea requiere leer, validar, transformar o generar archivos Excel (`.xlsx`, `.xlsb`, `.csv`) usando la librería `xlsx` (SheetJS), común en la carga masiva de obras, asignaciones, avance de contratos (SIAD, SENASOL) y bitácoras.

## Reglas principales
1. **Lectura asíncrona no bloqueante**: Procesar archivos grandes mediante `FileReader` o Web Workers con lectura por buffers (`arrayBuffer()`) para no congelar la UI de React.
2. **Normalización de encabezados**: Mapear y sanear nombres de columnas de hojas Excel (eliminar acentos, espacios extras, saltos de línea) antes de convertir a objetos tipados.
3. **Validación de esquemas**: Cada fila importada debe ser validada contra un esquema o tipo antes de ser enviada al backend o agregada al estado.
4. **Manejo de errores amigable**: Presentar al usuario un resumen detallado con número de fila y columna de los registros que fallaron validación.

## Patrones y Ejemplos

### Lectura segura de archivo
```typescript
import * as XLSX from 'xlsx';

export const parseExcelFile = async (file: File): Promise<any[]> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
};
```

## Lo que NO hacer
- No asumir que el usuario siempre cargará la hoja con el nombre por defecto o que los encabezados vienen en mayúsculas/minúsculas exactas.
- No procesar archivos masivos sin feedback visual de progreso o spinner de carga.

