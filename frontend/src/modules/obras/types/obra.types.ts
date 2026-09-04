export interface Obra {
  id: string;
  solicitudPo: string;
  anio: string;
  at: string;
  obra: string;
  tipoObra: string;
  rd: string;
  nombreSolicitante: string;
  orden: string;
  activo: string;
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
  nombreArea?: string;
  fechaProgramada?: string;
  fechaPago?: string;
  fechaAut?: string;
  fechaSupervision?: string;

  // Reports and contractor metadata fields
  oficioConsecutivo?: number;
  oficio?: string;
  contratista?: string;
  atRetiro?: string;
  siadRetiro?: string;
  numeroOficio?: string;
  coordenadaX?: string;
  coordenadaY?: string;

  estatus: 'PENDIENTE' | 'ASIGNADA' | 'TERMINADA' | 'CAPITALIZADA';
}
