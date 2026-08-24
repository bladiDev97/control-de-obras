import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ObrasUpdateDto {
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
  at?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  obra?: string;

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
  orden?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  activo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ordenRetiro?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fechaAsignacion?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fechaFinConstruccion?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fechaTermino?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fechaTerminoCampo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fechaCapitalizacion?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === '' || value === undefined || value === null ? undefined : Number(value)))
  @IsNumber()
  @IsOptional()
  diasSinCapitalizar?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contrato?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === '' || value === undefined || value === null ? undefined : Number(value)))
  @IsNumber()
  @IsOptional()
  diasObraAPORTACIONES?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  planoPdf?: string;

  // Bitacora fields
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  oficio?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fechaAut?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  materialesSalida?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fechaSupervision?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === '' || value === undefined || value === null ? undefined : Number(value)))
  @IsNumber()
  @IsOptional()
  oficioConsecutivo?: number;

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
  coordenadaX?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coordenadaY?: string;

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

  @ApiPropertyOptional({ enum: ['PENDIENTE', 'ASIGNADA', 'TERMINADA', 'CAPITALIZADA'] })
  @Transform(({ value }) => (value === '' || value === undefined || value === null ? undefined : value))
  @IsEnum(['PENDIENTE', 'ASIGNADA', 'TERMINADA', 'CAPITALIZADA'])
  @IsOptional()
  estatus?: 'PENDIENTE' | 'ASIGNADA' | 'TERMINADA' | 'CAPITALIZADA';
}
