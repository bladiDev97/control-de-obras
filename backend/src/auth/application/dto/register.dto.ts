//Dependencies
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

//Enums
import { GenderEnum } from '../../../shared/application/enum/gender.enum';

//DTO
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {

  @ApiProperty({ example: 'Bladi', description: 'name of user' })
  @IsString()
  @MinLength(1)
  userName: string;
  
  @ApiProperty({ example: 'Romero', description: 'user first last name' })
  @IsString()
  @MinLength(1)
  userPaternalName: string;
  
  @ApiProperty({ example: 'Pérez', description: 'user second last name' })
  @IsString()
  @MinLength(1)
  userMaternalName: string;
  
  @ApiProperty({ enum: GenderEnum, example: GenderEnum.Male, description: 'gender of the user' })
  @IsEnum(GenderEnum)
  userGender: GenderEnum;
  
  @ApiPropertyOptional({ example: '+52', description: 'side of the user phone number' })
  @IsString()
  @MinLength(1)
  @IsOptional()
  userLade?: string;

  @ApiPropertyOptional({ example: 4433394138, description: 'user phone number' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  userPhone?: number;

  @ApiPropertyOptional({ example: '1997-02-02', description: 'user date of birth' })
  @IsDateString()
  @IsOptional()
  userBirth?: string;

  @ApiPropertyOptional({ example: 'http://imagenUser', description: 'user image url' })
  @MinLength(1)
  @IsOptional()
  userImage?: string;

}
