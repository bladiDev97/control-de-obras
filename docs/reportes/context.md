# Contexto actual — Reportes

Última actualización: 2026-11-08

## Estado general
Implementado en `src/modules/reportes/`. Permite generar resúmenes tabulares del avance de obras y cuenta con utilidades de formato para impresión.

## Qué está implementado
- [x] Vistas de resumen por estado, zona y contratista.
- [x] Utilidades de impresión CSS en `handle_print` para formatos institucionales.
- [x] Exportación básica a Excel de listados de obras con SheetJS.
- [x] Reporte de avance de contrato MAROD con datos de SIAD_PLUS.

## Qué falta implementar
- [ ] Estandarización de componentes de exportación a PDF con encabezado institucional consistente.
- [ ] Reportes financieros con gráficos de barras por zona y ejercicio fiscal.

## Decisiones pendientes
- Ninguna bloqueante por el momento.
