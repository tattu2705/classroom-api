import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RetrieveForNotificationsDto {
  @ApiProperty({
    description: 'Sender teacher email',
    example: 'teacher1@gmail.com',
  })
  @IsEmail()
  @MaxLength(50)
  teacher: string;

  @ApiProperty({
    description: 'Notification message. Can be mentions @mentions to tag students.',
    example: 'Hello students! @student1@gmail.com @student2@gmail.com',
  })
  @IsString()
  @MaxLength(250)
  @IsNotEmpty()
  notification: string;
}
