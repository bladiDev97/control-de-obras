import { Entity, Attribute, INDEX_TYPE } from '@typedorm/common';
import { IZona } from '../../domain/ientities/i-zona.interface';
import { GenericEntity } from 'src/shared/infrastructure/entities/generic.entity';

@Entity({
  name: 'Zonas',
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
export class ZonaEntity extends GenericEntity implements IZona {
  @Attribute()
  zona: string;

  @Attribute()
  division: string;

  @Attribute()
  domicilio: string;

  @Attribute()
  colonia: string;

  @Attribute()
  municipio: string;

  @Attribute()
  estado: string;

  @Attribute()
  codigoPostal: string;

  @Attribute()
  telefono: string;

  @Attribute()
  numeroExtension: string;
}
