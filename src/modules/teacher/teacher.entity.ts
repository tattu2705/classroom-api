import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['email'])
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
