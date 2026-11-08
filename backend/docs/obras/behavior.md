# Módulo: Obras

## Propósito
Administra el registro, seguimiento, asignación, terminación y capitalización de obras públicas y civiles. Gestiona números de oficio consecutivos, importación masiva de expedientes, vinculación con contratos, supervisión de campo y planos arquitectónicos/técnicos.

## Entradas
- Datos generales de la obra: Solicitud PO, año, AT, nombre de obra, tipo de obra, RD, solicitante, orden, coordenadas (X, Y).
- Cargas de asignación: Contrato, contratista, fecha de asignación, oficio consecutivo, fecha programada de pago.
- Bitácoras y avances: Número de estimación, deducciones, materiales de salida, fecha de supervisión.
- Documentación técnica: Carga de planos en formato PDF.

## Salidas
- Registros completos de obras persistidos en la tabla DynamoDB `ControlDeObras`.
- Oficios de asignación generados con número consecutivo auditado.
- Proxy/Stream seguro de visualización de planos PDF desde S3.
- Reportes consolidados y estados de avance de obras.

## Reglas de negocio
1. Estados admitidos: `PENDIENTE`, `ASIGNADA`, `TERMINADA`, `CAPITALIZADA` y `CANCELADA`.
2. Una obra asignada requiere obligatoriamente AT, contrato o contratista, fecha de asignación o consecutivo asignado.
3. El número de oficio consecutivo no debe duplicarse dentro del mismo ejercicio o área; se audita y puede resecuenciarse controladamente.
4. Las obras canceladas son excluidas de reportes operativos activos y no pueden mutar a otros estados sin reapertura explícita.

