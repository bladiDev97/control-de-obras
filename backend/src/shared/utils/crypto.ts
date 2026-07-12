// src/shared/utils/crypto.service.ts
import * as dotenv from 'dotenv';
dotenv.config();

export class CryptoService {
  private static readonly secretKey = process.env.Crypto_SECRET ?? '';

  private static xorStrings(a: string, b: string): string {
    let result = '';
    for (let i = 0; i < a.length; i++) {
      result += String.fromCharCode(a.charCodeAt(i) ^ b.charCodeAt(i % b.length));
    }
    return result;
  }

  static encrypt(text: string): string {
    const xored = this.xorStrings(text, this.secretKey);
    return Buffer.from(xored, 'utf8').toString('base64');
  }

  static decrypt(encrypted: string): string {
    const xored = Buffer.from(encrypted, 'base64').toString('utf8');
    return this.xorStrings(xored, this.secretKey);
  }

  static encryptEmail(email: string): string {
    return this.encrypt(email);
  }

  static decryptEmail(encrypted: string): string {
    return this.decrypt(encrypted);
  }
}
