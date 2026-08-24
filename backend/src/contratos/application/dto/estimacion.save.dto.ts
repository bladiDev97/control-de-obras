import { IsString, IsOptional, IsObject, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EstimacionSaveDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  obra?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  at?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  numeroEstimacion?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avanceMvmo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bitacoraSupervision?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bitacoraAutorizacion?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  compSind?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  retenerIva?: boolean;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  conceptos?: { [conceptName: string]: number };
}
