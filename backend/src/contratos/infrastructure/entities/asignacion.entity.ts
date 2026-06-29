import { Entity, Attribute, INDEX_TYPE } from '@typedorm/common';
import { IAsignacion } from '../../domain/ientities/i-asignacion.interface';
import { GenericEntity } from 'src/shared/infrastructure/entities/generic.entity';

@Entity({
  name: 'Asignacion',
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
export class AsignacionEntity extends GenericEntity implements IAsignacion {
  @Attribute()
  numeroContrato: string;

  @Attribute()
  at: string;

  @Attribute()
  tipoObra?: string;

  @Attribute()
  obra?: string;

  @Attribute()
  orden?: string;

  @Attribute()
  activo?: string;

  @Attribute()
  conceptos: { [conceptName: string]: number };
}
