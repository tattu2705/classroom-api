  import {
    Inject,
    Injectable,
    NotFoundException,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { TeacherStudent } from './teacher-student.entity';
  import { In, Repository } from 'typeorm';
  import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
  import { KeyGenerator } from 'src/common/cache/key-generator.util';
  import { ERROR_MESSAGES } from 'src/common/constants/error.constant';
  import { StudentService } from 'src/modules/student/student.service';
  import { TeacherService } from 'src/modules/teacher/teacher.service';
  import { Teacher } from 'src/modules/teacher/teacher.entity';
  import { LIB_CONSTANT } from 'src/common/constants/lib.constant';
  import { SUCCESS_MESSAGES } from 'src/common/constants/success.constant';
  import { Student } from 'src/modules/student/student.entity';
  interface CommonStudentRaw {
    email: string;
  }

  @Injectable()
  export class RegistrationService {
    constructor(
      @InjectRepository(TeacherStudent)
      private studentTeacherRepo: Repository<TeacherStudent>,

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

      const uniqueEmails = [
        ...new Set(studentEmails.map((e) => e.toLowerCase())),
      ];

      const existingStudents =
        await this.studentService.findByEmails(uniqueEmails);
      const existingEmails = existingStudents.map((s) => s.email.toLowerCase());

      const missingMails = uniqueEmails.filter(
        (email) => !existingEmails.includes(email),
      );

      if (missingMails.length > 0) {
        throw new HttpException(
          ERROR_MESSAGES.STUDENT_NOT_FOUND(missingMails.join(', ')),
          HttpStatus.NOT_FOUND,
        );
      }

      const studentIds = existingStudents.map((s) => s.id);

      const existingRelations = await this.studentTeacherRepo.find({
        where: {
          teacherId: teacher.id,
          studentId: In(studentIds),
        },
      });

      if (existingRelations.length > 0) {
        const alreadyRegistered = existingRelations.map((r) => {
          const student = existingStudents.find(
            (s: Student) => s.id === r.studentId,
          );
          return student?.email;
        });

        throw new HttpException(
          ERROR_MESSAGES.STUDENT_ALREADY_REGISTERED(
            alreadyRegistered.join(', '),
            teacherEmail,
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      const relations = studentIds.map((studentId) => ({
        teacherId: teacher.id,
        studentId,
      }));

      await this.studentTeacherRepo.insert(relations);

      return { message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS };
    }

    async getCommonStudentsByTeachers(teacherEmails: string[]): Promise<{students: string[]}> {
      const cacheKey = KeyGenerator.generateCustomKey(
        'commonStudents',
        ...teacherEmails,
      );
      const cached = await this.cacheManager.get<string[]>(cacheKey);
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

      const result: CommonStudentRaw[] = await this.studentTeacherRepo
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

      await this.cacheManager.set(cacheKey, emails, LIB_CONSTANT.TEN_SECOND_TTL);

      return { students: emails };
    }

    async suspendStudent(studentEmail: string): Promise<{message: string}> {
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

    async retrieveNotificationReceipients(
      teacherEmail: string,
      notification: string,
    ) : Promise<{receipients: string[]}> {
      const cacheKey = KeyGenerator.generateCustomKey(
        'notificationRecipients',
        teacherEmail,
        notification,
      );
      const cached = await this.cacheManager.get<{receipients: string[]}>(cacheKey);
      if (cached) return cached;
      const teacher = await this.teacherService.findByEmail(teacherEmail);
      if (!teacher) {
        throw new NotFoundException(
          ERROR_MESSAGES.TEACHER_NOT_FOUND(teacherEmail),
        );
      }

      const registered = await this.studentTeacherRepo
        .createQueryBuilder('ts')
        .innerJoinAndSelect('ts.student', 'student')
        .where('ts.teacherId = :teacherId', { teacherId: teacher.id })
        .andWhere('student.isSuspended = false')
        .getMany();

      const registeredEmails = registered.map((r) => r.student?.email);

      const safeRegex = LIB_CONSTANT.NOTIFICATION_REGEX
      const mentionMatches = notification.match(safeRegex) || [];
      let mentionEmails = mentionMatches.map((m: string) => m.slice(1));

      const mentionedStudents =
        await this.studentService.findManyByEmails(mentionEmails);
      console.log(mentionedStudents, registeredEmails);
      const mentionValidEmails = mentionedStudents
        .filter((s: Student) => !s.isSuspended)
        .map((s: Student) => s?.email);

      const receipients = Array.from(
        new Set([...registeredEmails, ...mentionValidEmails]),
      );

      await this.cacheManager.set(cacheKey, { receipients }, LIB_CONSTANT.TEN_SECOND_TTL);

      return { receipients };
    }
  }
