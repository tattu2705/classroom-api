import { IsEmail, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsEnum(['teacher', 'student'], {
    message: 'Role must be either teacher or student',
  })
  role: 'teacher' | 'student';
}
