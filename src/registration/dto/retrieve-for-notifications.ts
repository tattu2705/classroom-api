import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RetrieveForNotificationsDto {
  @ApiProperty({
    description: 'Sender teacher email',
    example: 'teacher1@gmail.com',
  })
  @IsEmail()
  teacher: string;

  @ApiProperty({
    description: 'Notification message. Can be mentions @mentions to tag students.',
    example: 'Hello students! @student1@gmail.com @student2@gmail.com',
  })
  @IsString()
  @IsNotEmpty()
  notification: string;
}
