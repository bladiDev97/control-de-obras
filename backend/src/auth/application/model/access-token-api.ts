//Dependecies
import { ApiProperty } from '@nestjs/swagger';

//Interfaces
import { IAccessToken } from 'src/auth/domain/ientities/i-access-token.interface';

//interfaces

export class AccessTokenApi implements IAccessToken {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsIsR5cCI9IkaXZCJ9.eyJpZCI6MSwiZW1haWxVc2VyQ3JlZGVudGlhbCI6ImJsYWRpLlBpZ2VvblNhdmVAZ21haWwuY29tIiwiYWN0aXZlVXNlckNyZWRlbnRpYWwiOmZhbHNlLCJpYXQiOjE2OTI1NjI3ODUsImV4cCI6MTY5MjU2NjM4NX0.jGnNdYeRIuTWxiw8OR0VLmEj5lHdIP0fxj8dNR0KGwI',
    description: 'Token',
  })
  accessToken: string;
  
}
