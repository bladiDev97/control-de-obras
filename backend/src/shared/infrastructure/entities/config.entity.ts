import { Entity, Attribute, INDEX_TYPE } from '@typedorm/common';
import { ISmtpConfig } from '../../domain/ientities/i-config.interface';
import { GenericEntity } from 'src/shared/infrastructure/entities/generic.entity';

@Entity({
  name: 'Config',
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
export class ConfigEntity extends GenericEntity implements ISmtpConfig {
  @Attribute()
  host?: string;

  @Attribute()
  port?: number;

  @Attribute()
  user?: string;

  @Attribute()
  pass?: string;

  @Attribute()
  from?: string;

  @Attribute()
  whatsappPhone?: string;

  @Attribute()
  whatsappApiKey?: string;
}
