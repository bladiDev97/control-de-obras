//Entities
import { UserEntity } from 'src/auth/infrastructure/entities/user.entity';

//Interfaces
import { IUser } from '../ientities/i-user.interface';

export interface IUserRepository {
  getUserByEmail(email: string): Promise<UserEntity | null>;

  createUser(dto: IUser): Promise<UserEntity>;

  updateUser(dto: IUser): Promise<UserEntity>;

  delateUser(pk: string): Promise<UserEntity>;
}
