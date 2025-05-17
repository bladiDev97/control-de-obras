// src/shared/domain/entities/generic.entity.ts
//Dependencies
import { Attribute } from '@typedorm/common';

//Interfaces
import { IGenericEntity } from 'src/shared/domain/ientities/i-generic.interface';

export class GenericEntity implements IGenericEntity {
  @Attribute()
  pk: string;

  @Attribute()
  sk?: string;

  @Attribute()
  isDelete?: boolean;
}
