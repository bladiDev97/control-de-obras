import { IGenericEntity } from 'src/shared/domain/ientities/i-generic.interface';

export interface IEstimacion extends IGenericEntity {
  numeroContrato: string;
  at: string;
  obra?: string;
  numeroEstimacion: string; // e.g. "1", "2"
  avanceMvmo?: string;
  bitacoraSupervision?: string;
  bitacoraAutorizacion?: string;
  compSind?: number;
  retenerIva?: boolean;
  // Key value mapping of concept name to estimated quantity: { "POSTE NUEVO R.D.A.": 3 }
  conceptos: { [conceptName: string]: number };
}
