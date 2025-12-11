import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsEmail, ArrayNotEmpty, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsEmail()
  @MaxLength(50)
  @ApiProperty({
    example: 'teacher1@gmail.com',
    description: 'Email of the teacher',
    required: true,
  })
  teacher: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  @MaxLength(50)
  @ApiProperty({
    example: [
      'student1@gmail.com',
      'student2@gmail.com'
    ],
    description: 'Array of student emails to be registered under the teacher',
    required: true,
    type: [String],
  })
  students: string[];
}
