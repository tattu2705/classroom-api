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
  })
  role: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  status: string;
}
