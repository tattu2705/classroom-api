import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Unique(['email'])
  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: ['teacher', 'student'],
    default: 'user',
  })
  role: string;
}
