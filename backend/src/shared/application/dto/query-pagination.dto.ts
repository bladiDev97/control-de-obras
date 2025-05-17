//Dependencies
import { Type } from 'class-transformer';
import { GenericApi } from '../model/generic-api';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import { IGeneric } from 'src/shared/domain/ientities/i-generic.interface';

export class QueryPaginationDTO {
  @ApiPropertyOptional({ default: 20 })
  @IsPositive()
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ type: GenericApi})
  @IsOptional()
  @Type(() => GenericApi)
  cursor?: IGeneric;
}
