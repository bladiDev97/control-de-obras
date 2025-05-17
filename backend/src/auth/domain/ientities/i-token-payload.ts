//Dependencies
import { ITokenPayload } from './i-token-interface';

export interface IToken extends ITokenPayload {
  iat: number;
  exp: number;
}
