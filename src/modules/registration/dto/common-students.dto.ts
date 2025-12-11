import { Transform } from 'class-transformer';
import { IsArray, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CommonStudentsQueryDto {
  @IsArray()
  @IsEmail({}, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @ApiPropertyOptional({
    description: 'List of teacher emails, can parse multiple queries ?teacher=a@gmail.com&teacher=b@gmail.com',
    example: ['teacher1@gmail.com', 'teacher2@gmail.com'],
    required: false,
    type: [String],
  })
  teacher: string[];
}
