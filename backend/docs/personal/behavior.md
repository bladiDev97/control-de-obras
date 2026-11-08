# Módulo: Personal

## Propósito
Administra el catálogo y roles del personal técnico y operativo del sistema: residentes de obra, supervisores de campo, administradores y personal de soporte.

## Entradas
- Datos del personal: Nombre, apellidos, teléfono, correo electrónico, rol, zona y área asignada.

## Salidas
- Registros de personal persistidos en DynamoDB con entidad `PersonalEntity`.
- Listados para selección en formularios de asignación de obras y supervisión.

## Reglas de negocio
1. El personal activo puede ser asignado como residente o supervisor de una o varias obras simultáneamente.
2. Al dar de baja o inactivar un personal (`isDelete: true`), sus asignaciones históricas en obras existentes se preservan para auditoría.
3. El correo electrónico del personal debe ser único y validado en formato estándar.

