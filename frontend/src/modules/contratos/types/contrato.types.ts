export interface ConceptoContrato {
  codigo: string;
  costoUnitario: number;
  manoDeObra: number;
  cantidadContratada: number;
  cantidadAsignada?: number;
  cantidadEstimada?: number;
}

export interface Contrato {
  numeroContrato: string;
  licitacion?: string;
  contratista?: string;
  montoAutorizado: number;
  porcentajeAmpliacion: number;
  porcentajeAmpliacionTiempo?: number;
  fechaInicio?: string;
  fechaFin?: string;
  plazoDias?: number;
  direccion?: string;
  correos?: string[];
  residenteObra?: string;
  conceptos: ConceptoContrato[];
}

export interface Asignacion {
  id?: string;
  numeroContrato: string;
  at: string;
  tipoObra?: string;
  obra?: string;
  orden?: string;
  activo?: string;
  conceptos: { [conceptName: string]: number };
}

export interface Estimacion {
  id?: string;
  numeroContrato: string;
  at: string;
  tipoObra?: string;
  obra?: string;
  orden?: string;
  activo?: string;
  numeroEstimacion: string;
  avanceMvmo?: string;
  bitacoraSupervision?: string;
  bitacoraAutorizacion?: string;
  compSind?: number;
  retenerIva?: boolean;
  conceptos: { [conceptName: string]: number };
}
