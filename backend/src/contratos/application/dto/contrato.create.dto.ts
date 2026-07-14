import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConceptoContratoDto {
  @ApiProperty({ example: 'POSTE NUEVO R.D.A.', description: 'Código del concepto' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ example: 8499.82, description: 'Costo unitario del concepto' })
  @IsNumber()
  @IsNotEmpty()
  costoUnitario: number;

  @ApiProperty({ example: 4293.92, description: 'Costo de mano de obra del concepto' })
  @IsNumber()
  @IsNotEmpty()
  manoDeObra: number;

  @ApiProperty({ example: 60, description: 'Cantidad contratada autorizada' })
  @IsNumber()
  @IsNotEmpty()
  cantidadContratada: number;

  @ApiPropertyOptional({ example: 10, description: 'Cantidad asignada a obras' })
  @IsNumber()
  @IsOptional()
  cantidadAsignada?: number;

  @ApiPropertyOptional({ example: 5, description: 'Cantidad estimada o ejecutada' })
  @IsNumber()
  @IsOptional()
  cantidadEstimada?: number;
}

export class ContratoCreateDto {
  @ApiProperty({ example: '9400120159', description: 'Número de contrato' })
  @IsString()
  @IsNotEmpty()
  numeroContrato: string;

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
