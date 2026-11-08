# Módulo: Asignación

## Propósito
Permite la asignación formal de contratistas y personal técnico a las obras según el área técnica (AT), paquetes de obras y contratos vigentes. Gestiona tanto asignaciones individuales como por lote, y controla el proceso de reasignación cuando hay cambios de contratista.

## Entradas
- Catálogo de contratistas y contratos activos.
- Lista de obras en estado `PENDIENTE` disponibles para asignar.
- Datos de asignación: contratista, contrato, fecha de asignación, número de oficio.

## Salidas
- Obras actualizadas con estado `ASIGNADA` y número de oficio consecutivo.
- Oficio de asignación generado con membrete institucional y firma del supervisor.
- Notificaciones automáticas al contratista asignado y al anterior (en caso de reasignación).

## Reglas de negocio
1. Solo obras en estado `PENDIENTE` o `ASIGNADA` pueden recibir una nueva asignación o reasignación.
2. La reasignación requiere notificar al contratista anterior y al nuevo mediante correo o WhatsApp.
3. El número de oficio asignado debe ser consecutivo, único y auditado. No se puede saltar o duplicar consecutivos sin autorización explícita.
4. Las obras canceladas no pueden ser reasignadas.

