# Módulo: Reportes

## Propósito
Generación, visualización y descarga de reportes ejecutivos, operativos y financieros sobre el avance de las obras y contratos. Proporciona resúmenes tabulares y vistas preparadas para impresión o exportación.

## Entradas
- Rango de fechas, filtros por zona, contratista, estado de obra y tipo de reporte.

## Salidas
- Vistas de resumen tabular con totales por estado, zona y contratista.
- Exportaciones en formato PDF (impresión desde browser) o Excel (SheetJS).

## Reglas de negocio
1. Los reportes deben filtrar por defecto las obras canceladas salvo que se solicite explícitamente su inclusión.
2. Los totales financieros deben calcularse sobre estimaciones aprobadas, no sobre montos comprometidos.
3. Las vistas de impresión deben incluir encabezado institucional y fecha de generación.

