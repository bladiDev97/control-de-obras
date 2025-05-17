// // Dependencies

// // Services

// // Repositories
// import { UserRepository } from 'src/auth/infrastructure/repositories/user.repository';

// //Interfaces
// import { IUser } from '../interfaces/i-user.interface';

// //Entetnties
// import { UserEntity } from 'src/auth/infrastructure/entities/user.entity';

// // DTOs

// export class UserService {
//   private userRepository: UserRepository;

//   constructor() {
//     this.userRepository = new UserRepository();
//   }

//   /** get all users */
//   public async getAllUsers() {
//     const sk = 'profile';
//     return await this.userRepository.allUsers(sk);
//   }

//   /** get use */
//   public async getUser(sk: string) {
//     return await this.userRepository.getUserByEmail(sk);
//   }

//   /** update user */
//   public async updateUser(user: IUser) {
//     const userData = new UserEntity(user);
//     const { email, password, ...cleanUser } = userData;
//     await this.userRepository.updateItem(cleanUser as UserEntity);
//   }
// }
