# Decisiones técnicas — Personal

## [2026-07-08] Borrado Lógico en Entidades de Personal
**Decisión**: Emplear el atributo `isDelete: boolean` heredado de `GenericEntity` para dar de baja al personal, evitando el borrado físico (`DeleteItem`) en DynamoDB.
**Motivo**: Mantener la integridad referencial histórica con obras terminadas o bitácoras firmadas por el residente.
**Trade-off**: Las consultas de personal activo deben incluir explícitamente el filtro `isDelete !== true`.

## [2026-09-18] Centralización de Catálogo para Frontend
**Decisión**: Centralizar la carga del directorio técnico para alimentar en memoria los desplegables de supervisores, residentes y contratistas en los modales de asignación de obras.
**Motivo**: Reducir peticiones HTTP repetitivas durante la navegación del usuario en el panel de obras.
**Trade-off**: Es necesario invalidar o refrescar la caché cuando se agregue o edite un miembro del personal.

