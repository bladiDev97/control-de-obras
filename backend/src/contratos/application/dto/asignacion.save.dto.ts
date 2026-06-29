import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AsignacionSaveDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tipoObra?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  obra?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  orden?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  activo?: string;

  @ApiPropertyOptional()
  @IsObject()
  conceptos: { [conceptName: string]: number };
}
