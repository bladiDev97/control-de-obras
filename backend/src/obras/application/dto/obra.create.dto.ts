import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ObrasCreateDto {
  @ApiProperty({ example: 'PO12345', description: 'Solicitud o PO de la obra' })
  @IsString()
  @IsNotEmpty()
  solicitudPo: string;

  @ApiProperty({ example: '2026', description: 'Año de la obra' })
  @IsString()
  @IsNotEmpty()
  anio: string;

  @ApiProperty({ example: 'AT001', description: 'AT de la obra' })
  @IsString()
  @IsNotEmpty()
  at: string;

  @ApiProperty({ example: 'Obra de prueba', description: 'Nombre/Descripción de la obra' })
  @IsString()
  @IsNotEmpty()
  obra: string;

  @ApiProperty({ example: 'Tipo A', description: 'Tipo de la obra' })
  @IsString()
  @IsNotEmpty()
  tipoObra: string;

  @ApiProperty({ example: 'RD01', description: 'RD de la obra' })
  @IsString()
  @IsNotEmpty()
  rd: string;

  @ApiProperty({ example: 'Juan Perez', description: 'Nombre del solicitante' })
  @IsString()
  @IsNotEmpty()
  nombreSolicitante: string;

  @ApiProperty({ example: 'ORD-548425', description: 'Orden de la obra' })
  @IsString()
  @IsNotEmpty()
  orden: string;

  @ApiProperty({ example: 'ACT-670634', description: 'Activo de la obra' })
  @IsString()
  @IsNotEmpty()
  activo: string;

  @ApiPropertyOptional({ example: 'CON-789', description: 'Contrato de la obra' })
  @IsString()
  @IsOptional()
  contrato?: string;

  @ApiPropertyOptional({ example: 'RET-012', description: 'Orden de retiro' })
  @IsString()
  @IsOptional()
  ordenRetiro?: string;

  @ApiPropertyOptional({ example: '2026-06-01', description: 'Fecha de asignacion' })
  @IsString()
  @IsOptional()
  fechaAsignacion?: string;

  @ApiPropertyOptional({ example: '2026-06-15', description: 'Fecha fin construccion' })
  @IsString()
  @IsOptional()
  fechaFinConstruccion?: string;

  @ApiPropertyOptional({ example: '2026-06-20', description: 'Fecha termino en campo' })
  @IsString()
  @IsOptional()
  fechaTerminoCampo?: string;

  @ApiPropertyOptional({ example: '2026-06-25', description: 'Fecha de capitalizacion' })
  @IsString()
  @IsOptional()
  fechaCapitalizacion?: string;

  @ApiPropertyOptional({ example: 9, description: 'Dias de la obra SSEEBRA (Aportaciones)' })
  @IsNumber()
  @IsOptional()
  diasObraAPORTACIONES?: number;

  @ApiPropertyOptional({ example: 152, description: 'Consecutivo del oficio' })
  @IsNumber()
  @IsOptional()
  oficioConsecutivo?: number;



  @ApiPropertyOptional({ example: 'RV035', description: 'AT de retiro' })
  @IsString()
  @IsOptional()
  atRetiro?: string;

  @ApiPropertyOptional({ example: 'R0036', description: 'SIAD de retiro' })
  @IsString()
  @IsOptional()
  siadRetiro?: string;

  @ApiPropertyOptional({ example: '-101.2345', description: 'Coordenada X / Longitud' })
  @IsString()
  @IsOptional()
  coordenadaX?: string;

  @ApiPropertyOptional({ example: '19.5432', description: 'Coordenada Y / Latitud' })
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

  @ApiPropertyOptional({ enum: ['PENDIENTE', 'ASIGNADA', 'TERMINADA', 'CAPITALIZADA'], default: 'PENDIENTE' })
  @IsEnum(['PENDIENTE', 'ASIGNADA', 'TERMINADA', 'CAPITALIZADA'])
  @IsOptional()
  estatus?: 'PENDIENTE' | 'ASIGNADA' | 'TERMINADA' | 'CAPITALIZADA';
}
