# Contexto actual — Excel Import

Última actualización: 2026-11-08

## Estado general
Implementado en `src/modules/excelImport/`. Soporta formatos XLSX y XLSB habituales en el sistema de control de obras CFE.

## Qué está implementado
- [x] Lectura y parseo de archivos `.xlsx` y `.xlsb` con SheetJS en cliente.
- [x] Normalización de encabezados de columna antes del mapeo.
- [x] Previsualización tabular de los datos importados.
- [x] Validación básica de esquema de filas antes del envío a la API.
- [x] Soporte para importación masiva de obras desde plantilla Excel del sistema.

## Qué falta implementar
- [ ] Barra de progreso visual durante la carga de archivos voluminosos (> 5,000 filas).
- [ ] Reporte detallado descargable de filas con errores de validación.

## Decisiones pendientes
- Ninguna bloqueante por el momento.

