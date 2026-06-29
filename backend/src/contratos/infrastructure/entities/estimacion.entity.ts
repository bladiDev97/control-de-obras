import { Entity, Attribute, INDEX_TYPE } from '@typedorm/common';
import { IEstimacion } from '../../domain/ientities/i-estimacion.interface';
import { GenericEntity } from 'src/shared/infrastructure/entities/generic.entity';

@Entity({
  name: 'Estimacion',
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
export class EstimacionEntity extends GenericEntity implements IEstimacion {
  @Attribute()
  numeroContrato: string;

  @Attribute()
  at: string;

  @Attribute()
  obra?: string;

  @Attribute()
  numeroEstimacion: string;

  @Attribute()
  avanceMvmo?: string;

  @Attribute()
  bitacoraSupervision?: string;

  @Attribute()
  bitacoraAutorizacion?: string;

  @Attribute()
  compSind?: number;

  @Attribute()
  retenerIva?: boolean;

  @Attribute()
  conceptos: { [conceptName: string]: number };
}
