//Interfaces
import { IGenericEntity } from 'src/shared/domain/ientities/i-generic.interface';

export interface IObra extends IGenericEntity {
  id?: string;
  solicitudPo: string;
  anio: string;
  at: string;
  obra: string;
  tipoObra: string;
  rd: string;
  nombreSolicitante: string;
  orden: string;
  activo: string;
  
  // Optional and assignment fields
  ordenRetiro?: string;
  fechaAsignacion?: string;
  fechaFinConstruccion?: string;
  fechaTerminoCampo?: string;
  fechaCapitalizacion?: string;
  diasSinCapitalizar?: number;
  diasObraAPORTACIONES?: number;
  contrato?: string;
  planoPdf?: string;
  poblacion?: string;
  municipio?: string;
  area?: string;
  fechaProgramada?: string;
  fechaPago?: string;
  
  // Bitacoras fields
  oficio?: string;
  fechaAut?: string;
  materialesSalida?: string;
  fechaSupervision?: string;

  // Oficios and new assignments fields
  oficioConsecutivo?: number;
  atRetiro?: string;
  siadRetiro?: string;
  coordenadaX?: string;
  coordenadaY?: string;
  
  estatus: 'PENDIENTE' | 'ASIGNADA' | 'TERMINADA' | 'CAPITALIZADA';
}
