# Módulo: Obras

## Propósito
Administra el ciclo de vida completo de las obras públicas y civiles: registro inicial, asignación técnica a contratistas, bitácoras de campo, terminación física y capitalización contable. Incluye la auditoría de consecutivos de oficio, subida y visualización de planos técnicos en S3, e interfaces frontend reactivas para listado, edición, filtros combinados y visualización de expedientes.

## Entradas
- **Backend (API)**:
  - `CreateObraDto`: Solicitud PO, año, AT, nombre de obra, tipo de obra, RD, solicitante, orden, coordenadas (X, Y), zona.
  - `UpdateObraDto` / `AsignarObraDto`: Contrato, contratista, fecha de asignación, oficio consecutivo, fecha programada de pago, fecha de inicio y término.
  - Documentos técnicos: Carga de planos en formato PDF (multipart/form-data o S3).
- **Frontend (UI)**:
  - Vistas en `src/modules/obras/pages/ObrasPage.tsx`: Formularios de creación y edición modal, filtros por estado, contratista, zona y año, y subida interactiva de planos.

## Salidas
- Persistencia en AWS DynamoDB en la tabla única `ControlDeObras` (`pk: OBRA#<id>`, `sk: metadata`).
- Oficios de asignación generados con número consecutivo auditado.
- Proxy/Stream seguro de visualización de planos PDF desde AWS S3 vía `/obras/plano-view`.
- Respuestas API estandarizadas bajo `JsonResponse<IObra>`.
- Interfaz interactiva de listado con tablas reutilizables, badges de estatus y modales de edición.

## Reglas de negocio
1. **Estados del Ciclo de Vida**: `PENDIENTE`, `ASIGNADA`, `TERMINADA`, `CAPITALIZADA` y `CANCELADA`.
2. **Determinación Dinámica de Estatus**:
   - `PENDIENTE`: Obra registrada sin asignación de contratista, contrato ni número de oficio.
   - `ASIGNADA`: Requiere AT, contrato o contratista, fecha de asignación o consecutivo registrado.
   - `TERMINADA`: Requiere fecha de término de campo (`fechaTerminoCampo`) registrada.
   - `CAPITALIZADA`: Requiere fecha oficial de capitalización contable (`fechaCapitalizacion`).
   - `CANCELADA`: Obra con cancelación explícita (`fechaCancelacion`). Prevalece sobre cualquier otro estado y se excluye de listas operativas normales.
3. **Control de Oficios Consecutivos**: El número consecutivo de oficio es único por ejercicio y zona; su asignación o resecuenciación debe ejecutarse bajo auditoría para evitar duplicados.
4. **Almacenamiento de Planos**: Los archivos binarios deben almacenarse en S3 y referenciarse en el atributo `planoPdf`.

