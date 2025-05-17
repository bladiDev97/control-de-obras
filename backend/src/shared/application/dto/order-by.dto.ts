//Dependencies
import { ApiProperty } from '@nestjs/swagger';
import { QUERY_ORDER } from '@typedorm/common';

//Enums
import { IsEnum, IsString } from 'class-validator';


export class OrderBy {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty({ enum: QUERY_ORDER })
  @IsEnum(QUERY_ORDER)
  orderBy: QUERY_ORDER;
}
