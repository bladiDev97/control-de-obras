# Módulo: Capitalización

## Propósito
Control y seguimiento de obras concluidas que están aptas para el proceso contable y administrativo de capitalización de activos fijos. Permite revisar expedientes de obras terminadas, registrar su integración contable y hacer seguimiento del avance en el proceso de cierre fiscal.

## Entradas
- Obras en estatus `TERMINADA` con soporte documental completo y validación técnica.
- Fecha de capitalización oficial (`fechaCapitalizacion`) para cada expediente.

## Salidas
- Listado de expedientes pendientes de capitalizar, en proceso y capitalizados.
- Estatus de integración contable por obra.
- Vistas reactivas en `src/modules/capitalizacion/` con filtros por año, zona y circuito.

## Reglas de negocio
1. Solo las obras en estado `TERMINADA` son elegibles para iniciar el proceso de capitalización.
2. Una vez registrada `fechaCapitalizacion`, el estado de la obra pasa automáticamente a `CAPITALIZADA`.
3. Los filtros de capitalización deben permitir segmentar por ejercicio fiscal y circuito para facilitar el cierre contable anual.

