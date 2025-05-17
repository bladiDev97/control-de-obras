//Dependencies
import { Response } from 'express';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { Routes } from 'src/shared/routes/routes.constants';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';


// Interfaces
import { IAccessToken } from 'src/auth/domain/ientities/i-access-token.interface';

// Services
import { AuthService } from 'src/auth/domain/services/auth.service';

// DTOs
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

//Models
import { AccessTokenApi } from '../model/access-token-api';

//Utils
import { JsonResponse } from 'src/shared/application/model/json-response.class';
import { ApiJsonResponse } from 'src/shared/application/decorator/api-response.decorator';

@ApiExtraModels(AccessTokenApi)
@ApiTags(Routes.Auth.ApiTags)
@Controller(Routes.Auth.Controller)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post(Routes.Auth.Register)
  @ApiJsonResponse({ status: HttpStatus.OK, type: AccessTokenApi })
  public async register(@Res() response: Response, @Body() dto: RegisterDto): Promise<JsonResponse<AccessTokenApi>> {
    const result = await this.authService.register(dto);
    const jsonResponse = new JsonResponse<IAccessToken>({ data: result, message: 'User registered successfully' });
    response.status(HttpStatus.CREATED).send(jsonResponse);
    return jsonResponse;
  }

  @Post(Routes.Auth.Login)
  @ApiJsonResponse({ status: HttpStatus.OK, type: AccessTokenApi })
  public async login(@Res() response: Response, @Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    const jsonResponse = new JsonResponse<IAccessToken>({ data: result, message: 'Login successfully' });
    response.status(HttpStatus.CREATED).send(jsonResponse);
    return jsonResponse;
  }


}
