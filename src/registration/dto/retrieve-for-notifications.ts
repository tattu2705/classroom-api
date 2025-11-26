import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RetrieveForNotificationsDto {
  @IsEmail()
  teacher: string;

  @IsString()
  @IsNotEmpty()
  notification: string;
}
