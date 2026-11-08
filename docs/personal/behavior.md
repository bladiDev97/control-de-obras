# Módulo: Personal

## Propósito
Administra el directorio y catálogo del personal técnico y operativo del sistema: residentes de obra, supervisores de campo, administradores y personal de soporte. Alimenta los selectores de asignación de obras, firmas digitales de oficios y reportes técnicos tanto en backend como en frontend.

## Entradas
- Datos del personal: Nombre, apellidos, teléfono, correo electrónico, rol técnico, zona operativa y área asignada.

## Salidas
- Registros de personal persistidos en DynamoDB con entidad `PersonalEntity` (`pk: PERSONAL#<id>`, `sk: profile`).
- Endpoints REST para consulta y filtrado de personal activo.
- Componentes de selección y vistas de gestión en `frontend/src/modules/personal/`.

## Reglas de negocio
1. El personal activo puede ser vinculado como residente o supervisor de múltiples obras simultáneamente.
2. Al dar de baja a un personal (`isDelete: true`), sus registros y firmas históricas en obras y bitácoras deben preservarse íntegros para fines de auditoría.
3. El correo electrónico del personal debe ser único dentro del sistema y validado en formato estándar.

