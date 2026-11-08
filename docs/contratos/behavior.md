# Módulo: Contratos

## Propósito
Administra la información jurídica, técnica y financiera de los contratos de obra pública: contratistas adjudicados, techos presupuestales, importes asignados por Asignación Técnica (AT), y el registro y seguimiento de estimaciones de avance económico. En frontend, provee la interfaz para consultar contratos, montos consumidos y porcentaje de avance financiero.

## Entradas
- **Backend**:
  - Datos de contrato: Número de contrato, contratista, monto total contratado, fechas de vigencia, tipo de contrato.
  - Asignaciones: Vinculación entre contrato, obra (AT) y montos asignados.
  - Estimaciones: Número de estimación, monto ejecutado, amortizaciones, retenciones y fecha de corte.
- **Frontend**:
  - Formularios de captura de contratos, asignación presupuestal y registro de estimaciones en `src/modules/contratos/`.

## Salidas
- Contratos persistidos en DynamoDB con clave `CONTRATO#<id>`.
- Asignaciones y estimaciones indexadas vinculadas al contrato y obra correspondiente.
- Balance financiero acumulado de contratos (monto contratado vs monto estimado/ejecutado).
- Vistas reactivas en frontend con indicadores de avance financiero y porcentaje consumido.

## Reglas de negocio
1. No se pueden registrar estimaciones acumuladas que superen el monto total del contrato sin la existencia de un convenio modificatorio.
2. Cada estimación debe numerarse secuencialmente por contrato y obra.
3. El borrado o baja de un contrato requiere validar previamente que no tenga asignaciones ni obras activas vinculadas.
4. El cálculo de saldo disponible de un contrato es: `Saldo = MontoContratado - Suma(EstimacionesAprobadas)`.

