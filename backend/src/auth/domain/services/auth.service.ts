// Dependencies
import * as bcrypt from 'bcrypt';
import { Injectable, Logger } from '@nestjs/common';
import { ThrowError } from 'src/shared/utils/throwservererror';

// Services
import { JwtService } from './jwt.service';

// Repositories
import { UserRepository } from 'src/auth/infrastructure/repositories/user.repository';

// DTOs
import { LoginDto } from 'src/auth/application/dto/login.dto';
import { RegisterDto } from 'src/auth/application/dto/register.dto';

// Interfaces
import { IUser } from '../ientities/i-user.interface';
import { ITokenPayload } from '../ientities/i-token-interface';

// Utils
import { Errors } from 'src/shared/application/errors/errors.constants';
import { UserEntity } from 'src/auth/infrastructure/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  protected logger = new Logger(this.constructor.name);

  /** register */
  public async register(dto: RegisterDto) {
    const { email, ...rest } = dto;
    const userInput = Object.assign(new UserEntity(), rest);
    userInput.pk = email;
    userInput.password = this.hashPassword(dto.password);
    const user = await this.userRepository.createUser(userInput);
    return this.generateToken({
      email: user.pk,
    });
  }

  /** login */
  public async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) this.wrongCredentials();
    const isPassword = await this.chkPassword({ password, user });
    if (!isPassword) {
      this.wrongCredentials();
    } else {
      return this.generateToken({
        email: user.pk,
      });
    }
  }

  /** generateToken */
  private generateToken(payload: ITokenPayload) {
    const token = this.jwtService.sign(payload);
    return { accessToken: token };
  }

  /** wrongCredentials */
  private wrongCredentials() {
    ThrowError.httpException(Errors.Auth.ActivationFailed);
  }

  /** chkPassword */
  private async chkPassword(param: {
    user: IUser;
    password: string;
  }): Promise<boolean> {
    const { password, user } = param;
    return await bcrypt.compare(password, user.password);
  }

  /** hashPassword */
  private hashPassword(password: string): string {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
  }
}
