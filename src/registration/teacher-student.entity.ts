import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from '../student/student.entity';
import { Teacher } from '../teacher/teacher.entity';

@Entity('teacher_student')
export class TeacherStudent {
  @PrimaryColumn()
  teacherId: number;

  @PrimaryColumn()
  studentId: number;

  @ManyToOne(() => Teacher, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;
}
