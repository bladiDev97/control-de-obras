export interface IGeneric {
  pk: string;
  sk?: string;
}

export interface IGenericEntity extends IGeneric{
  isDelete?: boolean;
}
