import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WhatsappService } from './services/whatsapp.service';
import { ObrasVencidasCron } from './cron/obras-vencidas.cron';
import { ObrasModule } from '../obras/obras.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ObrasModule,
  ],
  providers: [
    WhatsappService,
    ObrasVencidasCron,
  ],
  exports: [
    WhatsappService,
    ObrasVencidasCron,
  ],
})
export class NotificationsModule {}
