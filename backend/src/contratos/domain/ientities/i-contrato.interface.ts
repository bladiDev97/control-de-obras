import { IGenericEntity } from 'src/shared/domain/ientities/i-generic.interface';

export interface IConceptoContrato {
  codigo: string;
  costoUnitario: number;
  manoDeObra: number;
  cantidadContratada: number;
  cantidadAsignada?: number;
  cantidadEstimada?: number;
}

export interface IContrato extends IGenericEntity {
  numeroContrato: string; // Will also serve as sk (contrato#<numeroContrato>)
  licitacion?: string;
  contratista?: string;
  montoAutorizado?: number;
  porcentajeAmpliacion?: number; // e.g. 30
  porcentajeAmpliacionTiempo?: number; // e.g. 15
  fechaInicio?: string;
  fechaFin?: string;
  plazoDias?: number;
  direccion?: string;
  correos?: string[];
  residenteObra?: string;
  conceptos: IConceptoContrato[];
}
