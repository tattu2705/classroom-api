import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateStudentDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Email of the student',
  })
  email: string;
}
