import {
  Inject,
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TeacherStudent } from './teacher-student.entity';
import { Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { KeyGenerator } from 'src/common/cache/key-generator.util';
import { ERROR_MESSAGES } from 'src/common/constants/error.constant';
import { StudentService } from 'src/student/student.service';
import { TeacherService } from 'src/teacher/teacher.service';
import { Teacher } from 'src/teacher/teacher.entity';
import { LIB_CONSTANT } from 'src/common/constants/lib.constant';
import { SUCCESS_MESSAGES } from 'src/common/constants/success.constant';
interface CommonStudentRaw {
  email: string;
}

const TTL = LIB_CONSTANT.TTL;

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(TeacherStudent)
    private registrationRepository: Repository<TeacherStudent>,

    private readonly studentService: StudentService,
    private readonly teacherService: TeacherService,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async register(
    teacherEmail: string,
    studentEmails: string[],
  ): Promise<{ message: string }> {
    const teacher = await this.teacherService.findByEmail(teacherEmail);
    if (!teacher) {
      throw new HttpException(
        ERROR_MESSAGES.TEACHER_NOT_FOUND(teacherEmail),
        HttpStatus.NOT_FOUND,
      );
    }

    for (const email of studentEmails) {
      const student = await this.studentService.createIfNotExists(email);

      const exist = await this.registrationRepository.findOne({
        where: {
          teacherId: teacher.id,
          studentId: student.id,
        },
      });

      if (exist) {
        throw new HttpException(
          ERROR_MESSAGES.STUDENT_ALREADY_REGISTERED(email, teacherEmail),
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.registrationRepository.save({
        teacherId: teacher.id,
        studentId: student.id,
      });
    }

    await this.cacheManager.del(
      KeyGenerator.generateCustomKey('registrations', teacherEmail),
    );

    return { message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS };
  }

  async getCommonStudentsByTeachers(teacherEmails: string[]) {
    const cacheKey = KeyGenerator.generateCustomKey('commonStudents', ...teacherEmails);
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return { students: cached };

    const teachers = await Promise.all(
      teacherEmails.map((email) => this.teacherService.findByEmail(email)),
    );

    if (teachers.some((t) => !t)) {
      throw new HttpException(
        ERROR_MESSAGES.TEACHER_GENERIC_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const teacherIds = teachers.map((t: Teacher) => t.id);

    const result: CommonStudentRaw[] = await this.registrationRepository
      .createQueryBuilder('ts')
      .select('student.email', 'email')
      .innerJoin('ts.student', 'student')
      .where('ts.teacherId IN (:...teacherIds)', { teacherIds })
      .groupBy('student.email')
      .having('COUNT(DISTINCT ts.teacherId) = :count', {
        count: teacherIds.length,
      })
      .getRawMany();

    const emails = result.map((r) => r.email);

    await this.cacheManager.set(cacheKey, emails, TTL);

    return { students: emails };
  }

  async suspendStudent(studentEmail: string) {
    const student = await this.studentService.findByEmail(studentEmail);

    if (!student) {
      throw new HttpException(
        ERROR_MESSAGES.STUDENT_NOT_FOUND(studentEmail),
        HttpStatus.NOT_FOUND,
      );
    }

    await this.studentService.suspend(studentEmail);

    return {
      message: SUCCESS_MESSAGES.SUSPENDED_SUCCESS(studentEmail),
    };
  }

  async retrieveNotificationRecipients(
    teacherEmail: string,
    notification: string,
  ) {
    const cacheKey = KeyGenerator.generateCustomKey(
      'notificationRecipients',
      teacherEmail,
      notification,
    );

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const teacher = await this.teacherService.findByEmail(teacherEmail);
    if (!teacher) {
      throw new NotFoundException(
        ERROR_MESSAGES.TEACHER_NOT_FOUND(teacherEmail),
      );
    }

    const registered = await this.registrationRepository
      .createQueryBuilder('ts')
      .innerJoin('ts.student', 'student')
      .where('ts.teacherId = :teacherId', { teacherId: teacher.id })
      .andWhere('student.isSuspended = false')
      .getMany();

    const registeredEmails = registered.map((r) => r.student.email);

    const mentionMatches = notification.match(/@([\w.-]+@[\w.-]+\.\w+)/g) || [];
    const mentionEmails = mentionMatches.map((m: string) =>
      m.slice(1).toLowerCase(),
    );

    const recipients = [...registeredEmails];

    for (const email of mentionEmails) {
      const student = await this.studentService.findByEmail(email);
      if (student && !student.isSuspended) {
        if (!recipients.includes(student.email)) {
          recipients.push(student.email);
        }
      }
    }

    await this.cacheManager.set(cacheKey, { recipients }, TTL);

    return { recipients };
  }
}
