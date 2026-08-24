import { Injectable, Inject } from '@nestjs/common';
import { EntityManager } from '@typedorm/core';
import { TypeDORMRepository } from 'src/shared/infrastructure/repository/generic.repository';
import { ConfigEntity } from '../entities/config.entity';
import { ISmtpConfig } from '../../domain/ientities/i-config.interface';
import { CryptoService } from '../../utils/crypto';

function isEncrypted(val?: string): boolean {
  if (!val) return false;
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  if (!base64Regex.test(val)) return false;
  try {
    const decrypted = CryptoService.decrypt(val);
    return /^[\x20-\x7E\s]*$/.test(decrypted);
  } catch {
    return false;
  }
}

function decryptField(val?: string): string | undefined {
  if (!val) return val;
  if (isEncrypted(val)) {
    return CryptoService.decrypt(val);
  }
  return val;
}

function encryptField(val?: string): string | undefined {
  if (!val) return val;
  if (val === '********') return val; // preserve masked UI value
  if (!isEncrypted(val)) {
    return CryptoService.encrypt(val);
  }
  return val;
}

@Injectable()
export class ConfigRepository extends TypeDORMRepository<ConfigEntity> {
  constructor(
    @Inject('ENTITY_MANAGER')
    protected readonly entityManager: EntityManager,
  ) {
    super(ConfigEntity, entityManager);
  }

  public async getSmtpConfig(pk: string): Promise<ConfigEntity | null> {
    try {
      const keys = { pk, sk: 'config#smtp' };
      const config = await super.getItem(keys);
      if (config) {
        if (config.user) config.user = decryptField(config.user);
        if (config.pass) config.pass = decryptField(config.pass);
        if (config.from) config.from = decryptField(config.from);
      }
      return config;
    } catch (err) {
      // Return null if not found
      return null;
    }
  }

  public async saveSmtpConfig(pk: string, data: ISmtpConfig): Promise<ConfigEntity> {
    data.pk = pk;
    data.sk = 'config#smtp';
    data.isDelete = false;

    // Encrypt sensitive fields
    if (data.user) data.user = encryptField(data.user);
    if (data.pass) data.pass = encryptField(data.pass);
    if (data.from) data.from = encryptField(data.from);

    const existing = await this.getSmtpConfig(pk);
    if (existing) {
      const mergedData = { ...existing, ...data };
      return await super.updateItem(mergedData as ConfigEntity);
    } else {
      return await super.createItem(data as ConfigEntity);
    }
  }
}
