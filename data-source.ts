import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Student } from './src/student/student.entity';
import { Teacher } from './src/teacher/teacher.entity';
import { TeacherStudent } from './src/registration/teacher-student.entity';
dotenv.config();

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as any,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Student, Teacher, TeacherStudent],
  synchronize: false,
  migrations: ['src/common/migration/*.ts'],
});
