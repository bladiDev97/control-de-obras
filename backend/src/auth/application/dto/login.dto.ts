//Dependencies
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'bladi.PigeonSave@gmail.com', description: 'email of the user credential' })
  @IsString()
  @MinLength(1)
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'bladiPassw', description: 'user password of the user credential' })
  @IsString()
  @MinLength(6)
  password!: string;
}
