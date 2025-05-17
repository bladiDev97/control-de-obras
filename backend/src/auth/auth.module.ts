//Dependencies
import { Module } from '@nestjs/common';

//Modules
import { SharedModule } from 'src/shared/shared.module';

//Services
import { AuthService } from './domain/services/auth.service';

//Repository
import { UserRepository } from './infrastructure/repositories/user.repository';

//Controllers
import { AuthController } from './application/controller/auth.controller';

//Services
import { JwtService } from './domain/services/jwt.service';

@Module({
  imports: [SharedModule],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtService],
  exports: [AuthService, UserRepository],
})
export class AuthModule {}
