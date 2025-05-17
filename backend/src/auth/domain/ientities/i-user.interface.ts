//Dependencies
import { IGenericEntity } from 'src/shared/domain/ientities/i-generic.interface';

//Enums
import { GenderEnum } from 'src/shared/application/enum/gender.enum';

export interface IUser extends IGenericEntity {
  password: string;
  userName: string;
  userPaternalName: string
  userMaternalName: string
  userGender: GenderEnum
  userBirth?: string
  userLade?: string
  userPhone?: number
  userImage?: string
}
