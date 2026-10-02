import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ObrasTerminarDto {
  @ApiPropertyOptional({ example: '2026-06-27', description: 'Fecha de término en campo' })
  @IsString()
  @IsOptional()
  fechaTerminoCampo?: string;

  @ApiPropertyOptional({ example: '2026-06-27', description: 'Fecha de término (Fin de Construcción)' })
  @IsString()
  @IsOptional()
  fechaFinConstruccion?: string;

  @ApiPropertyOptional({ example: '2026-06-27', description: 'Fecha de término (Alias)' })
  @IsString()
  @IsOptional()
  fechaTermino?: string;
}
