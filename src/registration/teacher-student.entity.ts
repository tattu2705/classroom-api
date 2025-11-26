import { User } from '../user/user.entity';
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('teacher_student')
export class TeacherStudent {
  @PrimaryColumn()
  teacherId: number;

  @PrimaryColumn()
  studentId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;
}
