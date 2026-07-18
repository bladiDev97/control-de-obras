import { EntityManager } from '@typedorm/core';
import { Inject, Injectable } from '@nestjs/common';
import { DocumentClientTypes } from '@typedorm/document-client';

import { ZonaEntity } from '../entities/zona.entity';
import { TypeDORMRepository } from 'src/shared/infrastructure/repository/generic.repository';
import { IZonasRepository } from '../../domain/irepositories/i-zonas.repository';
import { IZona } from '../../domain/ientities/i-zona.interface';
import { IGeneric } from 'src/shared/domain/ientities/i-generic.interface';
import { IQuery } from 'src/shared/domain/ientities/i-query';
import { nanoid } from 'nanoid';

@Injectable()
export class ZonasRepository
  extends TypeDORMRepository<ZonaEntity>
  implements IZonasRepository {
  constructor(
    @Inject('ENTITY_MANAGER')
    protected readonly entityManager: EntityManager,
  ) {
    super(ZonaEntity, entityManager);
  }

  async create(zona: Partial<IZona>): Promise<IZona> {
    const id = nanoid();
    zona.pk = 'zona';
    zona.sk = `zona#${id}`;
    zona.isDelete = false;
    return await super.createItem(zona as ZonaEntity);
  }

  async findAll(): Promise<IZona[]> {
    const keys: IGeneric = { pk: 'zona', sk: 'zona#' };
    const query: IQuery<ZonaEntity> = { limit: 1000 };
    const [items] = await super.itemsBySearchDTO<ZonaEntity>(keys, query);
    return items.filter(item => !item.isDelete);
  }

  async findById(id: string): Promise<IZona | null> {
    return await super.getItem({ pk: 'zona', sk: `zona#${id}` });
  }

  async update(id: string, zona: Partial<IZona>): Promise<IZona> {
    zona.pk = 'zona';
    zona.sk = `zona#${id}`;
    return await super.updateItem(zona as ZonaEntity);
  }

  async delete(id: string): Promise<boolean> {
    await super.delateItem({ pk: 'zona', sk: `zona#${id}` });
    return true;
  }
}
