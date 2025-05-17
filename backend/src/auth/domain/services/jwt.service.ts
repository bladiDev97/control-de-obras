/* eslint-disable @typescript-eslint/no-unsafe-return */
// Dependencies
import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { APIGatewayProxyEventHeaders } from 'aws-lambda';

// Interfaces
import { IToken } from '../ientities/i-token-payload';
import { ITokenPayload } from '../ientities/i-token-interface';

// Utilities
import { Logger } from 'src/shared/utils/logger';

@Injectable()
export class JwtService {
  
  private readonly secret: jwt.Secret;
  private readonly expiresIn: jwt.SignOptions['expiresIn'];

  constructor() {
    this.secret = process.env.JWT_SECRET as jwt.Secret;
    this.expiresIn = ((process.env.JWT_EXPIRES_IN) || '1h') as jwt.SignOptions['expiresIn'];
  }

  public sign(payload: ITokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    });
  }
  
  public decodeToken(token: string): IToken {
    return jwt.decode(token) as IToken;
  }

  public verifyToken(token: string): boolean {
    try {
      jwt.verify(token, process.env.JWT_SECRET );
      return true;
    } catch (error) {
      Logger.error(error as any, 'JwtService');
      return false;
    }
  }

  public extractToken(
    headers: APIGatewayProxyEventHeaders,
  ): string | undefined {
    const authHeader = headers['Authorization'] || headers['authorization'];
    return authHeader?.split(' ')[1];
  }
}
