import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherStudent } from './teacher-student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherStudent])],
  controllers: [TypeOrmModule],
  providers: [RegistrationService],
})
export class RegistrationModule {}
