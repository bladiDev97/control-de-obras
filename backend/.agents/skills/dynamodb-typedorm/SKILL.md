---
name: dynamodb-typedorm
description: Guía y patrones para modelado de datos, entidades TypeDORM, transacciones, consultas y Single-Table Design sobre AWS DynamoDB en la tabla ControlDeObras.
---

# Skill: DynamoDB y TypeDORM

## Cuándo se usa
Aplica cuando la tarea involucre modelado de datos, definición o ajuste de entidades TypeDORM, consultas, transacciones, paginación o scripts de migración y seed sobre la base de datos AWS DynamoDB.

## Reglas principales
1. **Single-Table Design**: Toda la información del backend se almacena en la tabla única `ControlDeObras`.
2. **Estructura de Llaves**:
   - `pk`: Clave de partición primaria (ej: `OBRA#<id>`, `CONTRATO#<id>`, `USER#<email>`, `AREA#<id>`).
   - `sk`: Clave de ordenamiento primaria (ej: `metadata`, `profile`, `ESTIMACION#<num>`).
   - `GSI1`: Índice Secundario Global configurado con `pk` = `{{sk}}` y `sk` = `{{pk}}` para consultas inversas y búsquedas bidireccionales.
3. **Herencia de Entidades**:
   - Las entidades en `infrastructure/entities/` deben extender de `GenericEntity` e implementar su respectiva interfaz en `domain/ientities/`.
   - Utilizar los decoradores de `@typedorm/common`: `@Entity`, `@Attribute`, `@AutoGenerateAttribute`.
4. **Repositorios Base**:
   - Los repositorios deben extender `TypeDORMRepository<T>` ubicado en `src/shared/infrastructure/repository/generic.repository.ts`.
   - Reutilizar métodos provistos como `itemsBySearchDTO`, `createItem`, `updateItem` y `getItem`.

## Patrones y ejemplos

### Definición de Entidad TypeDORM
```typescript
import { Entity, Attribute, INDEX_TYPE } from '@typedorm/common';
import { GenericEntity } from 'src/shared/infrastructure/entities/generic.entity';
import { IObra } from '../../domain/ientities/i-obra.interface';

@Entity({
  name: 'Obra',
  primaryKey: {
    partitionKey: '{{pk}}',
    sortKey: '{{sk}}',
  },
  indexes: {
    GSI1: {
      type: INDEX_TYPE.GSI,
      partitionKey: '{{sk}}',
      sortKey: '{{pk}}',
    },
  },
})
export class ObraEntity extends GenericEntity implements IObra {
  @Attribute()
  solicitudPo: string;

  @Attribute()
  at: string;

  @Attribute()
  estatus: 'PENDIENTE' | 'ASIGNADA' | 'TERMINADA' | 'CAPITALIZADA' | 'CANCELADA';
}
```

### Inicialización y Conexión de TypeDORM
La conexión está centralizada en `src/shared/infrastructure/database/typedorm.config.ts`.
- En desarrollo local: detecta `DYNAMO_ENDPOINT=http://localhost:8000`.
- En producción o AWS Lambda: omite el endpoint custom para conectarse a DynamoDB Cloud usando credenciales de IAM Role.

## Lo que NO hacer
- **NO crear tablas adicionales de DynamoDB**: toda entidad debe residir en la tabla única existente.
- **NO ejecutar operaciones `Scan` masivas sin filtrado**: utilizar consultas `Query` por `pk` o sobre `GSI1` siempre que sea posible.
- **NO importar `@typedorm` dentro de `domain/`**: la capa de dominio solo conoce interfaces TypeScript puras.
- **NO omitir `removeUndefinedValues: true`** en el DocumentClient, ya que DynamoDB rechaza atributos con valor `undefined`.
