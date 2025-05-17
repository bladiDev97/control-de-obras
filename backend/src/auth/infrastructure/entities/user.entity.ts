// src/auth/infrastructure/entities/user.entity.ts
//Dependencies
import { Entity, Attribute } from '@typedorm/common';

//Enums
import { GenderEnum } from 'src/shared/application/enum/gender.enum';

//Interfaces

//Entities
import { GenericEntity } from 'src/shared/infrastructure/entities/generic.entity';
import { IGenericEntity } from 'src/shared/domain/ientities/i-generic.interface';

@Entity({
  name: 'User',
  primaryKey: {
    partitionKey: '{{pk}}',
    sortKey: '{{sk}}',
  },
})
export class UserEntity extends GenericEntity implements IGenericEntity {
  @Attribute()
  password!: string;
  
  @Attribute()
  userName: string
  
  @Attribute()
  userPaternalName: string
  
  @Attribute()
  userMaternalName: string
  
  @Attribute()
  userGender: GenderEnum
  
  @Attribute()
  userBirth?: string
  
  @Attribute()
  userLade?: string
  
  @Attribute()
  userPhone?: number
  
  @Attribute()
  userImage?: string

}
