import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PersonalCreateDto {
  @ApiProperty({ example: '9048U', description: 'Registro Personal del Empleado' })
  @IsString()
  @IsNotEmpty()
  rpe: string;

  @ApiProperty({ example: 'Marcos', description: 'Nombre(s) del personal' })
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @ApiProperty({ example: 'Romero', description: 'Apellido paterno' })
  @IsString()
  @IsNotEmpty()
  apellidoPaterno: string;

  @ApiPropertyOptional({ example: 'Pérez', description: 'Apellido materno' })
  @IsString()
  @IsOptional()
  apellidoMaterno?: string;

  @ApiProperty({ example: 'Supervisor de Obra', description: 'Cargo o Rol en CFE' })
  @IsString()
  @IsNotEmpty()
  cargo: string;

  @ApiProperty({ example: 'marcos.romero@cfe.mx', description: 'Correo electrónico' })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiPropertyOptional({ example: 'Zona Pátzcuaro', description: 'Zona del personal' })
  @IsString()
  @IsOptional()
  zona?: string;
}
