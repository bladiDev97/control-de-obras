// eslint-disable-next-line @typescript-eslint/no-unused-vars

//Dependencies
import { Logger } from '@nestjs/common';
import { DocumentClientTypes } from '@typedorm/document-client';
import { EntityManager, getBatchManager, ReadBatch } from '@typedorm/core';
import { KeyConditionOptions } from '@typedorm/core/cjs/src/classes/expression/key-condition-options-type';

//Entities
import { GenericEntity } from '../entities/generic.entity';

//Interfaces
import { IQuery } from 'src/shared/domain/ientities/i-query';
import { IGeneric } from 'src/shared/domain/ientities/i-generic.interface';

//Utils
import { CryptoService } from 'src/shared/utils/crypto';
import { ThrowError } from 'src/shared/utils/throwservererror';
import { Errors } from 'src/shared/application/errors/errors.constants';

//DTOS
import { EntityTarget } from '@typedorm/common';
import { SearchDTO } from 'src/shared/application/dto/search.dto';

export abstract class TypeDORMRepository<T extends GenericEntity> {
  constructor(
    protected readonly entityClass: new () => T,
    protected readonly entityManager: EntityManager,
  ) { }
  protected logger = new Logger(this.constructor.name);

  /**Create Item */
  async createItem(obj: T): Promise<T> {
    try {
      obj = this.cleanUndefined(obj);
      obj = Object.assign(new this.entityClass(), obj);
      const { pk, sk } = obj;

      obj.pk = CryptoService.encryptEmail(pk);
      if (sk === 'profile') {
        await this.verifyExists(obj);
        const item = await this.entityManager.create<T>(obj);
        return item;
      } else {
        await this.verifyExists(obj);
        const item = await this.entityManager.create<T>(obj);
        return item;
      }
    } catch (error) {
      this.logger.error('>>>>>>>>>>>>', error);
      throw error;
    }
  }


  async itemsBySearchDTO<T>(keys: IGeneric, query: IQuery<T>): Promise<[T[], DocumentClientTypes.Key]> {
    let { pk, sk } = keys;
    pk = CryptoService.encryptEmail(pk);
    const keyCondition: KeyConditionOptions = {
      BEGINS_WITH: sk
    };
    const result = await this.entityManager.find<T>(this.entityClass, pk, {
      orderBy: query.orderBy,
      keyCondition,
      where: query.where,
      limit: query.limit,
      cursor: query.cursor,
    });

    return [result.items, result.cursor ?? null];
  }




  /**GetItem */
  async getItem(keys: IGeneric): Promise<T> {
    const pk = CryptoService.encryptEmail(keys.pk);
    const sk = keys.sk;
    try {
      const item = await this.entityManager.findOne<T, Partial<T>>(
        this.entityClass,
        {
          pk,
          sk,
        } as T,
      );


      if (!item || item.isDelete == true) {
        ThrowError.httpException(
          Errors.GenericRepository.EntityNotFound,
          Array(CryptoService.decryptEmail(pk)),
        );
      }

      item.pk = CryptoService.decryptEmail(item.pk);
      return item;
    } catch (error) {
      this.logger.error(`Error al buscar entidad con pk=${pk}, sk=${sk}`);
      throw error;
    }
  }

  /**Batch Get Items */
  async getBatchItems<T>(
    entityClass: EntityTarget<T>,
    keys: IGeneric[]
  ): Promise<T[]> {
    const batch = new ReadBatch()

    for (const key of keys) {
      key.pk = CryptoService.encryptEmail(key.pk);
      batch.addGet<T, IGeneric>(entityClass, key)
    }

    const response = await getBatchManager().read(batch)

    let items = response.items as T[]

    if (response.unprocessedItems.length > 0) {
      const retryBatch = new ReadBatch().add(response.unprocessedItems)
      const retryResponse = await getBatchManager().read(retryBatch)
      items = [...items, ...(retryResponse.items as T[])]
    }

    if (!items || items.length < 2) {
      ThrowError.httpException(
        Errors.GenericRepository.ConstraintError,
        Array(`array of keys`),
      );
    } else {
      return items
    }

  }

  /**UpdateItem */
  async updateItem(body: T): Promise<T> {
    body = this.cleanUndefined(body);
    body = Object.assign(new this.entityClass(), body);
    const keys: IGeneric = { pk: body.pk, sk: body.sk };
    const existing = await this.getItem(keys);

    if (!existing) {
      ThrowError.httpException(
        Errors.GenericRepository.EntityNotFound,
        Array(keys.pk, keys.sk),
      );
    }

    const merged = this.mergeValid(existing, body);
    const cleanedMerged = this.cleanUndefined(merged);
    let { pk, sk, ...propertiesUpdate } = cleanedMerged;
    pk = CryptoService.encryptEmail(pk);
    cleanedMerged.pk = pk;
    const itemUpdate = await this.entityManager.update(
      this.entityClass,
      { pk, sk },
      propertiesUpdate as T,
    );
    if (!itemUpdate) {
      throw new Error(`error al actualizar la entidad `);
    }
    itemUpdate.pk = CryptoService.decryptEmail(itemUpdate.pk);
    return itemUpdate;
  }

  /**Delate Item */
  async delateItem(keys: IGeneric): Promise<T> {
    const existing = await this.getItem(keys);
    keys.pk = CryptoService.encryptEmail(keys.pk);
    await this.entityManager.delete<T>(this.entityClass, keys as Partial<T>);
    existing.pk = CryptoService.decryptEmail(existing.pk);
    return existing;
  }


  //FilterOptions<T, string | Partial<EntityAttributes<T>>>
  //Get filters for where
  getFilters(dto: SearchDTO): any {
    const where: any = { AND: {} };

    dto.filters.forEach((filter) => {
      where.AND[filter.key] = {
        [filter.operator]: filter.value
      };
    });

    return where;
  }

  /**Cast Items */
  private mergeValid<T extends object>(existing: T, incoming: Partial<T>): T {
    const result = { ...existing };

    Object.entries(incoming).forEach(([key, value]) => {
      const isEmpty = value === null || value === undefined || value === '';
      if (!isEmpty) {
        result[key as keyof T] = value as T[keyof T];
      }
    });

    return result;
  }

  //**Verify Exists */
  private async verifyExists(obj: T) {
    const exists = await this.entityManager.exists(this.entityClass, {
      pk: obj.pk,
      sk: obj.sk,
    } as Partial<T>);
    if (exists) {
      ThrowError.httpException(
        Errors.GenericRepository.ConstraintError,
        Array(CryptoService.decryptEmail(obj.pk)),
      );
    }

  }

  private cleanUndefined<K>(val: K): K {
    if (val === null || val === undefined) {
      return val;
    }
    if (Array.isArray(val)) {
      return val.map((item) => this.cleanUndefined(item)) as unknown as K;
    }
    if (typeof val === 'object') {
      const cleaned: any = {};
      for (const key of Object.keys(val)) {
        const itemVal = (val as any)[key];
        if (itemVal !== undefined) {
          cleaned[key] = this.cleanUndefined(itemVal);
        }
      }
      return cleaned as K;
    }
    return val;
  }
}
