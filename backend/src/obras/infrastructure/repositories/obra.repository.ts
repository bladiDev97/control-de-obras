//Dependencies
import { EntityManager } from '@typedorm/core';
import { Inject, Injectable } from '@nestjs/common';
import { DocumentClientTypes } from '@typedorm/document-client';

//Entities
import { ObraEntity } from '../entities/obra.entity';

//Repository
import { TypeDORMRepository } from 'src/shared/infrastructure/repository/generic.repository';

//Utils
import { Filters, Operator, SearchDTO } from 'src/shared/application/dto/search.dto';

//Interfaces
import { IQuery } from 'src/shared/domain/ientities/i-query';
import { IObra } from '../../domain/ientities/i-obra.interface';
import { IGeneric } from 'src/shared/domain/ientities/i-generic.interface';
import { IObraRepository } from '../../domain/irepositories/i-obra.repository.interface';

@Injectable()
export class ObraRepository
  extends TypeDORMRepository<ObraEntity>
  implements IObraRepository {
  constructor(
    @Inject('ENTITY_MANAGER')
    protected readonly entityManager: EntityManager,
  ) {
    super(ObraEntity, entityManager);
  }

  public async obraCreate(body: IObra): Promise<ObraEntity> {
    if (body.sk && !body.sk.startsWith('obra#')) {
      body.sk = `obra#${body.sk}`;
    }
    body.isDelete = false;
    return await super.createItem(body as ObraEntity);
  }

  public async obraUpdate(dto: IObra): Promise<ObraEntity> {
    if (dto.sk && !dto.sk.startsWith('obra#')) {
      dto.sk = `obra#${dto.sk}`;
    }
    return await super.updateItem(dto as ObraEntity);
  }

  public async obraSearch(pk: string, dto: SearchDTO): Promise<[ObraEntity[], DocumentClientTypes.Key]> {
    const sk = `obra#`;
    const keys: IGeneric = { pk, sk };
    const deleteFilter: Filters = { key: 'isDelete', operator: Operator.EQUAL, value: false };
    dto.filters.push(deleteFilter);

    const query: IQuery<ObraEntity> = {
      orderBy: dto.orderBy,
      limit: dto.limit,
      where: super.getFilters(dto),
      cursor: dto.cursor
    };

    return await super.itemsBySearchDTO<ObraEntity>(keys, query);
  }

  public async obraDetail(keys: IGeneric): Promise<ObraEntity> {
    if (keys.sk && !keys.sk.startsWith('obra#')) {
      keys.sk = `obra#${keys.sk}`;
    }
    return await super.getItem(keys);
  }

  public async obraDelete(keys: IGeneric): Promise<ObraEntity> {
    if (keys.sk && !keys.sk.startsWith('obra#')) {
      keys.sk = `obra#${keys.sk}`;
    }
    return await super.delateItem(keys);
  }

  public async obraListAll(pk: string): Promise<ObraEntity[]> {
    const sk = `obra#`;
    const keys: IGeneric = { pk, sk };
    const query: IQuery<ObraEntity> = {
      limit: 1000,
    };
    const [items] = await super.itemsBySearchDTO<ObraEntity>(keys, query);
    // Filter out deleted items manually since itemsBySearchDTO uses general query without filter unless specified
    return items.filter(item => !item.isDelete);
  }
}
