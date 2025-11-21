import { User } from '../user/user.entity';
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('teacher_student')
export class TeacherStudent {
  @PrimaryColumn()
  teacher_id: number;

  @PrimaryColumn()
  student_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;
}
