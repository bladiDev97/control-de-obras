import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ObrasImportDto {
  @ApiProperty({ type: [Object], description: 'Arreglo de filas importadas desde el archivo Excel' })
  @IsArray()
  @IsNotEmpty()
  rows: any[];

  @ApiPropertyOptional({ example: 'siad-plus', description: 'Tipo de archivo excel a importar: siad-plus o senasol' })
  @IsString()
  @IsOptional()
  type?: 'siad-plus' | 'senasol';
}
