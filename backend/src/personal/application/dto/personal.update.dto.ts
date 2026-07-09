import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PersonalUpdateDto {
  @ApiProperty({ example: '9048U', description: 'Registro Personal del Empleado' })
  @IsString()
  @IsNotEmpty()
  rpe: string;

  @ApiPropertyOptional({ example: 'Marcos', description: 'Nombre(s) del personal' })
  @IsString()
  @IsOptional()
  nombres?: string;

  @ApiPropertyOptional({ example: 'Romero', description: 'Apellido paterno' })
  @IsString()
  @IsOptional()
  apellidoPaterno?: string;

  @ApiPropertyOptional({ example: 'Pérez', description: 'Apellido materno' })
  @IsString()
  @IsOptional()
  apellidoMaterno?: string;

  @ApiPropertyOptional({ example: 'Supervisor de Obra', description: 'Cargo o Rol en CFE' })
  @IsString()
  @IsOptional()
  cargo?: string;

  @ApiPropertyOptional({ example: 'marcos.romero@cfe.mx', description: 'Correo electrónico' })
  @IsEmail()
  @IsOptional()
  correo?: string;

  @ApiPropertyOptional({ example: 'Zona Pátzcuaro', description: 'Zona del personal' })
  @IsString()
  @IsOptional()
  zona?: string;
}
