import { IGenericEntity } from 'src/shared/domain/ientities/i-generic.interface';

export interface IZona extends IGenericEntity {
  zona: string;
  division: string;
  domicilio: string;
  colonia: string;
  municipio: string;
  estado: string;
  codigoPostal: string;
  telefono: string;
  numeroExtension: string;
}
