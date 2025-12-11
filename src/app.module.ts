import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import { RegistrationModule } from './modules/registration/registration.module';
import { CacheModule } from '@nestjs/cache-manager';
import { StudentModule } from './modules/student/student.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { LIB_CONSTANT } from './shared/constants/lib.constant';
import { dataSourceOptions } from './config/data-source';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
    }),
    StudentModule,
    TeacherModule,
    RegistrationModule,
    CacheModule.register({ isGlobal: true, ttl: LIB_CONSTANT.TEN_SECOND_TTL }),
  ],
})
export class AppModule {}
