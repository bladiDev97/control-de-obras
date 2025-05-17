//Dependencies
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

//DTOS
import { QueryPaginationDTO } from './query-pagination.dto';

export class QuerySelectorDTO extends QueryPaginationDTO {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  value?: string;
}
