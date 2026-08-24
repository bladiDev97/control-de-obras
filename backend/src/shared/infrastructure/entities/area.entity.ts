import { Entity, Attribute, INDEX_TYPE } from '@typedorm/common';
import { GenericEntity } from './generic.entity';

@Entity({
  name: 'Area',
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
export class AreaEntity extends GenericEntity {
  @Attribute()
  area: string;

  @Attribute()
  nombreArea?: string;
}
