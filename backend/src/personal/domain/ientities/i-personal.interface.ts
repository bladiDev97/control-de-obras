import { IGenericEntity } from 'src/shared/domain/ientities/i-generic.interface';

export interface IPersonal extends IGenericEntity {
  id?: string;
  rpe: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  cargo: string;
  correo: string;
  zona?: string;
}
