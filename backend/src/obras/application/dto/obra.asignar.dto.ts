import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ObrasAsignarDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  at?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tipoObra?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  rd?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nombreSolicitante?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ordenRetiro?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  orden?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  activo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fechaAsignacion?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fechaTerminoCampo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contrato?: string;



  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  atRetiro?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  siadRetiro?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  planoPdf?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  obra?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  poblacion?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  municipio?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  area?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fechaProgramada?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fechaPago?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fechaAut?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fechaSupervision?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coordenadaX?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coordenadaY?: string;

  @ApiPropertyOptional()
  @IsOptional()
  diasObraAPORTACIONES?: any;

  @ApiPropertyOptional()
  @IsOptional()
  diasSinCapitalizar?: any;

  @ApiPropertyOptional()
  @IsOptional()
  oficioConsecutivo?: any;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  estatus?: 'PENDIENTE' | 'ASIGNADA' | 'TERMINADA' | 'CAPITALIZADA';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  solicitudPo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  anio?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fechaFinConstruccion?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fechaTermino?: string;
}
