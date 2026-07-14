import { IGenericEntity } from 'src/shared/domain/ientities/i-generic.interface';

export interface ISmtpConfig extends IGenericEntity {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  from?: string;
  whatsappPhone?: string;
  whatsappApiKey?: string;
}
