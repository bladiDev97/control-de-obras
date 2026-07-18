//Dependencies
import { Module } from '@nestjs/common';

//Modules
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { ObrasModule } from './obras/obras.module';
import { ContratosModule } from './contratos/contratos.module';
import { PersonalModule } from './personal/personal.module';
import { NotificationsModule } from './notifications/notifications.module';

import { ZonasModule } from './zonas/zonas.module';

@Module({
  imports: [SharedModule, AuthModule, ObrasModule, ContratosModule, PersonalModule, NotificationsModule, ZonasModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
