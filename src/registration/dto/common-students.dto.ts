import { Transform } from 'class-transformer';
import { IsArray, IsEmail } from 'class-validator';

export class CommonStudentsQueryDto {
  @IsArray()
  @IsEmail({}, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  teacher: string[];
}
