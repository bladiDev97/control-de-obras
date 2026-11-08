# Módulo: Bitácoras

## Propósito
Registro, seguimiento y consulta de bitácoras de campo asociadas a las obras: notas técnicas, avisos de media tensión (MT), oficios generados por supervisión y novedades operativas. Incluye la generación de formatos imprimibles y exportables para entrega a las autoridades competentes.

## Entradas
- Capturas de notas de campo con fecha, contenido, estado del avance y autor (supervisor/residente).
- Registros de avisos MT con número de aviso, circuito afectado y estado de resolución.
- Fotografías o referencias documentales de inspección.

## Salidas
- Historial cronológico de bitácora por obra.
- Formatos de avisos MT imprimibles generados desde plantillas membretadas.
- Vistas detalladas en `src/modules/bitacoras/`.

## Reglas de negocio
1. Las bitácoras se asocian obligatoriamente a una obra registrada en el sistema.
2. Los avisos MT tienen un ciclo: apertura, seguimiento y cierre. No se pueden cerrar sin registrar la fecha de resolución.
3. Los formatos generados deben incluir membrete institucional y firma del supervisor responsable.
