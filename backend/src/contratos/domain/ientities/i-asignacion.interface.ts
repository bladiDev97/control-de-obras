import { IGenericEntity } from 'src/shared/domain/ientities/i-generic.interface';

export interface IAsignacion extends IGenericEntity {
  numeroContrato: string; // Used in key mapping
  at: string; // Work unique code (matches row)
  tipoObra?: string; // SEEBRA, FSUE, etc.
  obra?: string; // e.g. E0057
  orden?: string;
  activo?: string;
  // Key value mapping of concept name to quantity: { "POSTE NUEVO R.D.A.": 5 }
  conceptos: { [conceptName: string]: number };
}
