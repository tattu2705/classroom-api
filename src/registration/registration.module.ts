import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherStudent } from './teacher-student.entity';
import { RegistrationController } from './registration.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherStudent]), UserModule],
  exports: [TypeOrmModule],
  controllers: [RegistrationController],
  providers: [RegistrationService],
})
export class RegistrationModule {}
