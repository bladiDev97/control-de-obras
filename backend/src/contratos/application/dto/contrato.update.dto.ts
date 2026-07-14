import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ConceptoContratoDto } from './contrato.create.dto';

export class ContratoUpdateDto {
  @ApiPropertyOptional({ example: 'LO-019GYR004-E23-2026', description: 'Licitación pública' })
  @IsString()
  @IsOptional()
  licitacion?: string;

  @ApiPropertyOptional({ example: 'MAROD', description: 'Contratista o empresa adjudicada' })
  @IsString()
  @IsOptional()
  contratista?: string;

  @ApiPropertyOptional({ example: 2249136.15, description: 'Monto total autorizado sin IVA' })
  @IsNumber()
  @IsOptional()
  montoAutorizado?: number;

  @ApiPropertyOptional({ example: 30, description: 'Porcentaje de ampliación en monto autorizado' })
  @IsNumber()
  @IsOptional()
  porcentajeAmpliacion?: number;

  @ApiPropertyOptional({ example: 15, description: 'Porcentaje de ampliación en tiempo autorizado' })
  @IsNumber()
  @IsOptional()
  porcentajeAmpliacionTiempo?: number;

  @ApiPropertyOptional({ example: '2026-04-01', description: 'Fecha de inicio del plazo' })
  @IsString()
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Fecha de término del plazo' })
  @IsString()
  @IsOptional()
  fechaFin?: string;

  @ApiPropertyOptional({ example: 275, description: 'Plazo de ejecución en días' })
  @IsNumber()
  @IsOptional()
  plazoDias?: number;

  @ApiPropertyOptional({ description: 'Dirección del contratista' })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiPropertyOptional({ type: [String], description: 'Lista de correos de contacto' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  correos?: string[];

  @ApiPropertyOptional({ description: 'Nombre del residente de obra' })
  @IsString()
  @IsOptional()
  residenteObra?: string;

  @ApiPropertyOptional({ type: [ConceptoContratoDto], description: 'Catálogo de conceptos y cantidades' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ConceptoContratoDto)
  conceptos?: ConceptoContratoDto[];
}
