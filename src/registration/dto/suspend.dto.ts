import { IsString } from 'class-validator';

export class SuspendDto {
  @IsString()
  student: string;
}
