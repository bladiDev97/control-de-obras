import { Entity, Attribute, INDEX_TYPE } from '@typedorm/common';
import { IContrato, IConceptoContrato } from '../../domain/ientities/i-contrato.interface';
import { GenericEntity } from 'src/shared/infrastructure/entities/generic.entity';

@Entity({
  name: 'Contrato',
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
export class ContratoEntity extends GenericEntity implements IContrato {
  @Attribute()
  numeroContrato: string;

  @Attribute()
  licitacion?: string;

  @Attribute()
  contratista?: string;

  @Attribute()
  montoAutorizado?: number;

  @Attribute()
  porcentajeAmpliacion?: number;

  @Attribute()
  porcentajeAmpliacionTiempo?: number;

  @Attribute()
  fechaInicio?: string;

  @Attribute()
  fechaFin?: string;

  @Attribute()
  plazoDias?: number;

  @Attribute()
  direccion?: string;

  @Attribute()
  correos?: string[];

  @Attribute()
  residenteObra?: string;

  @Attribute()
  conceptos: IConceptoContrato[];
}
