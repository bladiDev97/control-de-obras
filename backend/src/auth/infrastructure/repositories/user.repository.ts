//Dependencies
import { EntityManager } from '@typedorm/core';
import { Inject, Injectable } from '@nestjs/common';
import { TypeDORMRepository } from 'src/shared/infrastructure/repository/generic.repository';

//Entities
import { UserEntity } from '../entities/user.entity';

//interface
import { IGeneric } from 'src/shared/domain/ientities/i-generic.interface';
import { IUser } from 'src/auth/domain/ientities/i-user.interface';
import { IUserRepository } from 'src/auth/domain/irepositories/i-user.repository.interface';

@Injectable()
export class UserRepository
  extends TypeDORMRepository<UserEntity>
  implements IUserRepository
{
  constructor(
    @Inject('ENTITY_MANAGER')
    protected readonly entityManager: EntityManager,
  ) {
    super(UserEntity, entityManager);
  }

  public async getUserByEmail(email: string): Promise<UserEntity> {
    const keys: IGeneric = { pk: email, sk: 'profile' };
    return await super.getItem(keys);
  }

  public async createUser(body: IUser): Promise<UserEntity> {
    body.sk = 'profile';
    body.isDelete = false;
    return await super.createItem(body);
  }

  public async updateUser(dto: IUser): Promise<UserEntity> {
    let user = new UserEntity();
    user = dto;
    return await super.updateItem(user);
  }

  public async delateUser(pk: string): Promise<UserEntity> {
    const sk: string = 'profile';
    const keys : IGeneric = {pk, sk};
    return await super.delateItem(keys);
  }
}
