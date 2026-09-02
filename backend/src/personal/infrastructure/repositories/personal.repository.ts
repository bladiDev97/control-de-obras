import { EntityManager } from '@typedorm/core';
import { Inject, Injectable } from '@nestjs/common';
import { DocumentClientTypes } from '@typedorm/document-client';

//Entities
import { PersonalEntity } from '../entities/personal.entity';

//Repository
import { TypeDORMRepository } from 'src/shared/infrastructure/repository/generic.repository';

//Utils
import { Filters, Operator, SearchDTO } from 'src/shared/application/dto/search.dto';

//Interfaces
import { IQuery } from 'src/shared/domain/ientities/i-query';
import { IPersonal } from '../../domain/ientities/i-personal.interface';
import { IGeneric } from 'src/shared/domain/ientities/i-generic.interface';
import { IPersonalRepository } from '../../domain/irepositories/i-personal.repository.interface';

import { globalCache } from 'src/shared/utils/cache.util';

@Injectable()
export class PersonalRepository
  extends TypeDORMRepository<PersonalEntity>
  implements IPersonalRepository {
  constructor(
    @Inject('ENTITY_MANAGER')
    protected readonly entityManager: EntityManager,
  ) {
    super(PersonalEntity, entityManager);
  }

  public async personalCreate(body: IPersonal): Promise<PersonalEntity> {
    globalCache.clear(`personal_all_${body.pk}`);
    body.sk = `personal#${body.rpe}`;
    body.isDelete = false;
    return await super.createItem(body as PersonalEntity);
  }

  public async personalUpdate(dto: IPersonal): Promise<PersonalEntity> {
    globalCache.clear(`personal_all_${dto.pk}`);
    dto.sk = `personal#${dto.rpe}`;
    return await super.updateItem(dto as PersonalEntity);
  }

  public async personalSearch(pk: string, dto: SearchDTO): Promise<[PersonalEntity[], DocumentClientTypes.Key]> {
    const sk = `personal#`;
    const keys: IGeneric = { pk, sk };
    const deleteFilter: Filters = { key: 'isDelete', operator: Operator.EQUAL, value: false };
    dto.filters.push(deleteFilter);

    const query: IQuery<PersonalEntity> = {
      orderBy: dto.orderBy,
      limit: dto.limit,
      where: super.getFilters(dto),
      cursor: dto.cursor
    };

    return await super.itemsBySearchDTO<PersonalEntity>(keys, query);
  }

  public async personalDetail(keys: IGeneric): Promise<PersonalEntity> {
    const detailKeys = { pk: keys.pk, sk: `personal#${keys.sk}` };
    return await super.getItem(detailKeys);
  }

  public async personalDelete(keys: IGeneric): Promise<PersonalEntity> {
    globalCache.clear(`personal_all_${keys.pk}`);
    const deleteKeys = { pk: keys.pk, sk: `personal#${keys.sk}` };
    return await super.delateItem(deleteKeys);
  }

  public async personalListAll(pk: string): Promise<PersonalEntity[]> {
    const cacheKey = `personal_all_${pk}`;
    const cached = globalCache.get<PersonalEntity[]>(cacheKey);
    if (cached) return cached;

    const sk = `personal#`;
    const keys: IGeneric = { pk, sk };
    const query: IQuery<PersonalEntity> = {
      limit: 1000,
    };
    const [items] = await super.itemsBySearchDTO<PersonalEntity>(keys, query);
    const result = (items || []).filter(item => item && !item.isDelete);
    globalCache.set(cacheKey, result, 30000);
    return result;
  }
}
