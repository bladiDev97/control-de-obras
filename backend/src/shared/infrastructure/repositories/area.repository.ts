import { Injectable, Inject } from '@nestjs/common';
import { EntityManager } from '@typedorm/core';
import { TypeDORMRepository } from 'src/shared/infrastructure/repository/generic.repository';
import { AreaEntity } from '../entities/area.entity';
import { IGeneric } from 'src/shared/domain/ientities/i-generic.interface';
import { IQuery } from 'src/shared/domain/ientities/i-query';

@Injectable()
export class AreaRepository extends TypeDORMRepository<AreaEntity> {
  constructor(
    @Inject('ENTITY_MANAGER')
    protected readonly entityManager: EntityManager,
  ) {
    super(AreaEntity, entityManager);
  }

  public async areaListAll(pk: string): Promise<AreaEntity[]> {
    const sk = 'area#';
    const keys: IGeneric = { pk, sk };
    const query: IQuery<AreaEntity> = {
      limit: 1000,
    };
    const [items] = await super.itemsBySearchDTO<AreaEntity>(keys, query);
    return items.filter(item => !item.isDelete);
  }

  public async areaCreate(pk: string, nombreArea: string): Promise<AreaEntity> {
    const entity = new AreaEntity();
    entity.pk = pk;
    entity.sk = `area#${nombreArea}`;
    entity.area = nombreArea;
    entity.nombreArea = nombreArea;
    entity.isDelete = false;
    return await super.createItem(entity);
  }
}
