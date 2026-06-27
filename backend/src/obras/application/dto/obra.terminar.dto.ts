import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ObrasTerminarDto {
  @ApiProperty({ example: '2026-06-27', description: 'Fecha de término en campo' })
  @IsString()
  @IsNotEmpty()
  fechaTerminoCampo: string;
}
