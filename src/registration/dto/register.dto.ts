import { IsString, IsArray } from 'class-validator';

export class RegisterDto {
  @IsString()
  teacher: string;

  @IsArray()
  @IsString({ each: true })
  students: string[];
}
