export interface IGenericRepository<T> {
  createEntity(entity: T): Promise<T>;
  updateEntity(pk: string, sk: string, data: Partial<T>): Promise<T>;
  deleteEntity(pk: string, sk: string): Promise<void>;
  findOne(pk: string, sk: string): Promise<T>;
  findAllByPK(pk: string): Promise<T[]>;
}
