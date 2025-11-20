import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TeacherStudent } from './teacher-student.entity';
import { Repository } from 'typeorm';
@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(TeacherStudent)
    private registrationRepository: Repository<TeacherStudent>,
  ) {}

  async register(
    teacher_id: number,
    student_id: number,
  ): Promise<TeacherStudent> {
    const registration = this.registrationRepository.create({
      teacher_id: teacher_id,
      student_id: student_id,
    });
    return this.registrationRepository.save(registration);
  }
}
