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
    teacher_email: string,
    student_emails: string[],
  ): Promise<{ success: boolean; message: string }> {
    const teacher = await this.userRepository.findOne({
      where: { email: teacher_email, role: 'teacher' },
    });

    if (!teacher) {
      return {
        success: false,
        message: `Teacher with email ${teacher_email} not found`,
      };
    }

    const students: User[] = [];

    for (const student_email of student_emails) {
      const student = await this.userRepository.findOne({
        where: { email: student_email, role: 'student' },
      });
      if (!student) {
        throw new NotFoundException(
          `Student with email ${student_email} not found`,
        );
      }
      students.push(student);
    }

    for (const student of students) {
      const exist = await this.registrationRepository.findOne({
        where: { teacher_id: teacher.id, student_id: student.id },
      });

      if (!exist) {
        await this.registrationRepository.save({
          teacher_id: teacher.id,
          student_id: student.id,
        });
      } else {
        return {
          success: false,
          message: `Student with email ${student.email} is already registered under teacher with email ${teacher_email}`,
        };
      }
    }
    return {
      success: true,
      message: 'Registration successful',
    };
  }

  async getCommonStudentsByTeachers(teacher_email: string[]) {
    const teachers = await this.userRepository.find({
      where: teacher_email.map((email) => ({ email, role: 'teacher' })),
    });

    if (!teachers.length) {
      return {
        success: false,
        message: `Teachers not found`,
      };
    }

    const teacherIds = teachers.map((teacher) => teacher.id);

    const result: CommonStudentRaw[] = await this.registrationRepository
      .createQueryBuilder('ts')
      .select('u.email', 'email')
      .innerJoin(User, 'u', 'ts.student_id = u.id')
      .where('ts.teacher_id IN (:...teacherIds)', { teacherIds })
      .groupBy('u.email')
      .having('COUNT(DISTINCT ts.teacher_id) = :teacherCount', {
        teacherCount: teacherIds.length,
      })
      .getRawMany();
    return {
      students: result.map((r) => r.email),
    };
  }

  async suspendStudent(student_email: string) {
    const student = await this.userRepository.findOne({
      where: { email: student_email, role: 'student' },
    });

    if (!student) {
      return {
        success: false,
        message: `Student with email ${student_email} not found`,
      };
    }

    student.status = 'suspended';
    await this.userRepository.save(student);

    return {
      success: true,
      message: `Student with email ${student_email} has been suspended`,
    };
  }

  async retrieveNotificationRecipients(
    teacher_email: string,
    notification: string,
  ) {
    const teacher = await this.userRepository.findOne({
      where: { email: teacher_email, role: 'teacher' },
    });

    if (!teacher) {
      return {
        message: `Teacher with email ${teacher_email} not found`,
      };
    }

    const registeredStudents = await this.registrationRepository
      .createQueryBuilder('ts')
      .innerJoinAndSelect('ts.student', 'student')
      .where('ts.teacher_id = :teacherId', { teacherId: teacher.id })
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
