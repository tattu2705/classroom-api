import { DataSource } from "typeorm";
import { Student } from "src/modules/student/student.entity";
import { Teacher } from "src/modules/teacher/teacher.entity";
import { TeacherStudent } from "src/modules/registration/teacher-student.entity";
import dotenv from "dotenv";
dotenv.config();

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Student, Teacher, TeacherStudent],
});

async function seed() {
  await AppDataSource.initialize();

  const studentRepo = AppDataSource.getRepository(Student);
  const teacherRepo = AppDataSource.getRepository(Teacher);
  const teacherStudentRepo = AppDataSource.getRepository(TeacherStudent);

  const teacherA = teacherRepo.create({ email: "teacherA@example.com" });
  const teacherB = teacherRepo.create({ email: "teacherB@example.com" });

  await teacherRepo.save([teacherA, teacherB]);

  const student1 = studentRepo.create({ email: "student1@example.com" });
  const student2 = studentRepo.create({ email: "student2@example.com" });
  const student3 = studentRepo.create({ email: "student3@example.com" });

  await studentRepo.save([student1, student2, student3]);

  await teacherStudentRepo.save([
    { teacherId: teacherA.id, studentId: student1.id },
    { teacherId: teacherA.id, studentId: student2.id },
    { teacherId: teacherB.id, studentId: student3.id },
  ]);

  process.exit();
}

seed();
