# Módulo: Contratos

## Propósito
Gestiona la información legal y financiera de contratistas, contratos de obras públicas, asignaciones por Asignación Técnica (AT) y el registro y seguimiento de estimaciones de avance de obra.

## Entradas
- Datos de contrato: Número de contrato, contratista, monto contratado, fechas de inicio y término, tipo de contrato.
- Asignaciones: Vinculación entre número de contrato, obra (AT) e importes asignados.
- Estimaciones: Número de estimación, monto ejecutado, amortizaciones, retenciones y fecha de corte.

## Salidas
- Contratos persistidos en DynamoDB con partición `CONTRATO#<id>`.
- Asignaciones y estimaciones indexadas vinculadas a la obra y contrato correspondiente.
- Balance financiero acumulado de contratos (monto contratado vs monto estimado/ejecutado).

## Reglas de negocio
1. No se pueden registrar estimaciones que superen el monto total contratado o asignado sin convenio modificatorio.
2. Cada estimación debe numerarse secuencialmente por contrato y obra.
3. El borrado de un contrato requiere verificar que no existan asignaciones activas vinculadas.

