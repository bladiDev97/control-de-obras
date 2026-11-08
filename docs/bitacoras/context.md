# Contexto actual — Bitácoras

Última actualización: 2026-11-08

## Estado general
Implementado en `src/modules/bitacoras/`. Maneja el registro de notas técnicas de campo y avisos MT con generación de formatos imprimibles.

## Qué está implementado
- [x] Registro y listado de notas de bitácora por obra.
- [x] Gestión de avisos de media tensión (MT) con estados de apertura y cierre.
- [x] Generación de formatos membretados CFE para impresión directa en browser.
- [x] Extracción y procesamiento de datos de bitácoras desde archivos SIAD y reportes MT.

## Qué falta implementar
- [ ] Vista previa integrada de oficios y reportes antes de impresión desde el modal de detalle.
- [ ] Adjunto de fotografías de inspección directamente en la bitácora digital.

## Decisiones pendientes
- Evaluar si el historial de bitácoras debe migrarse a DynamoDB con entidad propia o mantenerse como atributo anidado de la obra.

## Notas para la próxima sesión
- Los archivos de historia de bitácoras CFE se extraen de reportes 880/980 con el script `extract_history.py` en `frontend/`.

