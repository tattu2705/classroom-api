import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class SuspendDto {
  @ApiProperty({
    description: 'Email of the student to be suspended',
    example: 'student1@gmail.com',
  })
  @IsString()
  @MaxLength(50)
  student: string;
}
