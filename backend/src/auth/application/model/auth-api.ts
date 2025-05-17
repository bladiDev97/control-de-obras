//Dependencies
import { ApiProperty } from '@nestjs/swagger';

//Interfaces
import { IAuth } from 'src/auth/domain/ientities/i-auth-interface';

export class AuthApi implements IAuth {
  @ApiProperty({ example: 'modification of credentials', description: 'response message when modifying credentials' })
  message: string;
}
