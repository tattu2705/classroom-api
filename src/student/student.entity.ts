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
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ default: false })
  isSuspended: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
