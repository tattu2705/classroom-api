import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TeacherStudent } from './teacher-student.entity';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

interface CommonStudentRaw {
  email: string;
}
@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(TeacherStudent)
    private registrationRepository: Repository<TeacherStudent>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(
    teacherEmail: string,
    studentEmails: string[],
  ): Promise<{ message: string }> {
    const teacher = await this.userRepository.findOne({
      where: { email: teacherEmail, role: 'teacher' },
    });

    if (!teacher) {
      throw new NotFoundException(
        `Teacher with email ${teacherEmail} not found`,
      );
    }

    const students: User[] = [];

    for (const studentEmail of studentEmails) {
      const student = await this.userRepository.findOne({
        where: { email: studentEmail, role: 'student' },
      });
      if (!student) {
        throw new NotFoundException(
          `Student with email ${studentEmail} not found`,
        );
      }
      students.push(student);
    }

    for (const student of students) {
      const exist = await this.registrationRepository.findOne({
        where: { teacherId: teacher.id, studentId: student.id },
      });

      if (!exist) {
        await this.registrationRepository.save({
          teacherId: teacher.id,
          studentId: student.id,
        });
      } else {
        throw new NotFoundException(
          `Student with email ${student.email} is already registered under teacher with email ${teacherEmail}`,
        );
      }
    }
    return {
      message: 'Registration successful',
    };
  }

  async getCommonStudentsByTeachers(teacherEmails: string[]) {
    const teachers = await this.userRepository.find({
      where: teacherEmails.map((email) => ({ email, role: 'teacher' })),
    });

    if (!teachers.length) {
      throw new NotFoundException(`Teacher not found`);
    }

    const teacherIds = teachers.map((teacher) => teacher.id);

    const result: CommonStudentRaw[] = await this.registrationRepository
      .createQueryBuilder('ts')
      .select('u.email', 'email')
      .innerJoin(User, 'u', 'ts.studentId = u.id')
      .where('ts.teacherId IN (:...teacherIds)', { teacherIds })
      .groupBy('u.email')
      .having('COUNT(DISTINCT ts.teacherId) = :teacherCount', {
        teacherCount: teacherIds.length,
      })
      .getRawMany();
    return {
      students: result.map((r) => r.email),
    };
  }

  async suspendStudent(studentEmail: string) {
    const student = await this.userRepository.findOne({
      where: { email: studentEmail, role: 'student' },
    });

    if (!student) {
      throw new NotFoundException(
        `Student with email ${studentEmail} not found`,
      );
    }

    student.status = 'suspended';
    await this.userRepository.save(student);

    return {
      message: `Student with email ${studentEmail} has been suspended`,
    };
  }

  async retrieveNotificationRecipients(
    teacherEmail: string,
    notification: string,
  ) {
    const teacher = await this.userRepository.findOne({
      where: { email: teacherEmail, role: 'teacher' },
    });

    if (!teacher) {
      throw new NotFoundException(
        `Teacher with email ${teacherEmail} not found`,
      );
    }

    const registeredStudents = await this.registrationRepository
      .createQueryBuilder('ts')
      .innerJoinAndSelect('ts.student', 'student')
      .where('ts.teacherId = :teacherId', { teacherId: teacher.id })
      .andWhere('student.status = :status', { status: 'active' })
      .getMany();

    const registeredEmails = registeredStudents.map((rs) => rs?.student?.email);

    let mentionStudents: string[] = [];

    if (notification.includes('@')) {
      mentionStudents = notification.match(/@([\w.-]+@[\w.-]+\.\w+)/g) || [];
    }

    const mentionEmails = mentionStudents.map((mention: string) =>
      mention.slice(1).toLowerCase(),
    );

    const receipients: string[] = [];
    receipients.push(...registeredEmails);

    for (const email of mentionEmails) {
      const student = await this.userRepository.findOne({
        where: { email, role: 'student', status: 'active' },
      });
      if (student && !receipients.includes(student.email)) {
        receipients.push(student.email);
      }
    }

    return {
      receipients,
    };
  }
}
