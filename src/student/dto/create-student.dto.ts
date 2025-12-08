import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateStudentDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
