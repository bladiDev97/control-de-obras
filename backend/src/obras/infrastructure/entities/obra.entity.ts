//Dependencies
import { Entity, Attribute, INDEX_TYPE } from '@typedorm/common';

//Interfaces
import { IObra } from '../../domain/ientities/i-obra.interface';

//Entities
import { GenericEntity } from 'src/shared/infrastructure/entities/generic.entity';

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
  anio: string;

  @Attribute()
  at: string;

  @Attribute()
  obra: string;

  @Attribute()
  tipoObra: string;

  @Attribute()
  rd: string;

  @Attribute()
  nombreSolicitante: string;

  @Attribute()
  orden: string;

  @Attribute()
  activo: string;

  @Attribute()
  ordenRetiro?: string;

  @Attribute()
  fechaAsignacion?: string;

  @Attribute()
  fechaFinConstruccion?: string;

  @Attribute()
  fechaTerminoCampo?: string;

  @Attribute()
  fechaCapitalizacion?: string;

  diasSinCapitalizar?: number;

  @Attribute()
  diasObraAPORTACIONES?: number;

  @Attribute()
  contrato?: string;

  @Attribute()
  planoPdf?: string;

  @Attribute()
  poblacion?: string;

  @Attribute()
  municipio?: string;

  @Attribute()
  area?: string;

  @Attribute()
  fechaProgramada?: string;

  @Attribute()
  fechaPago?: string;

  // Bitacoras fields
  @Attribute()
  oficio?: string;

  @Attribute()
  fechaAut?: string;

  @Attribute()
  materialesSalida?: string;

  @Attribute()
  fechaSupervision?: string;

  @Attribute()
  oficioConsecutivo?: number;

  @Attribute()
  atRetiro?: string;

  @Attribute()
  siadRetiro?: string;

  @Attribute()
  coordenadaX?: string;

  @Attribute()
  coordenadaY?: string;

  @Attribute()
  estatus: 'PENDIENTE' | 'ASIGNADA' | 'TERMINADA' | 'CAPITALIZADA';
}
