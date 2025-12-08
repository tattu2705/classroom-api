import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateTeacherDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
