//Dependencies
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, ValidateNested, IsArray, IsString, ValidateIf, IsNumber, IsBoolean } from 'class-validator';

//DTOS
import { QueryPaginationDTO } from './query-pagination.dto';
import { QUERY_ORDER } from '@typedorm/common';

export enum Operator {
  EQUAL = 'EQ',
  GREATER = 'GT',
  LESS = 'LT',
  GREATER_EQUAL = 'GE',
  LESS_EQUAL = 'LE',
  NOT_EQUAL = 'NE',
  STARTS_WITH = 'BEGINS_WITH',
  CONTAINS = 'CONTAINS',
}

export class Filters {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({ enum: Operator, default: Operator.CONTAINS })
  @IsOptional()
  @IsEnum(Operator)
  operator: Operator;

  @ApiPropertyOptional({
    oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' },]
  })
  @IsOptional()
  @ValidateIf((o) => typeof o.value === 'string')
  @IsString()
  @ValidateIf((o) => typeof o.value === 'number')
  @IsNumber()
  @ValidateIf((o) => typeof o.value === 'boolean')
  @IsBoolean()
  value: string | number | boolean;
}

export class SearchDTO extends QueryPaginationDTO {
  @ApiPropertyOptional({ type: [Filters] })
  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => Filters)
  filters?: Filters[] = [];

  @ApiPropertyOptional({ enum: QUERY_ORDER })
  @IsEnum(QUERY_ORDER)
  @IsOptional()
  orderBy?: QUERY_ORDER;
}
