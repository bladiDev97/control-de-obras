import { Entity, Attribute, INDEX_TYPE } from '@typedorm/common';
import { IPersonal } from '../../domain/ientities/i-personal.interface';
import { GenericEntity } from 'src/shared/infrastructure/entities/generic.entity';

@Entity({
  name: 'Personal',
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
export class PersonalEntity extends GenericEntity implements IPersonal {
  @Attribute()
  rpe: string;

  @Attribute()
  nombres: string;

  @Attribute()
  apellidoPaterno: string;

  @Attribute()
  apellidoMaterno?: string;

  @Attribute()
  cargo: string;

  @Attribute()
  correo: string;

  @Attribute()
  zona?: string;
}
