import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import { RegistrationModule } from './registration/registration.module';
import { TeacherStudent } from './registration/teacher-student.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { Student } from './student/student.entity';
import { Teacher } from './teacher/teacher.entity';
import { StudentModule } from './student/student.module';
import { TeacherModule } from './teacher/teacher.module';
import { LIB_CONSTANT } from './common/constants/lib.constant';
dotenv.config();

const { TTL } = LIB_CONSTANT;
@Module({
  imports: [
    TypeOrmModule.forRoot({
      // eslint-disable-next-line
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT as string, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      entities: [TeacherStudent, Student, Teacher],
      // synchronize: process.env.DB_SYNC === 'true',
      database: process.env.DB_NAME,
    }),
    RegistrationModule,
    StudentModule,
    TeacherModule,
    CacheModule.register({ isGlobal: true, ttl: TTL }),
  ],
})
export class AppModule {}
