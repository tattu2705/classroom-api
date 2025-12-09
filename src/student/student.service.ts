import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Student } from './student.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { KeyGenerator } from 'src/common/cache/key-generator.util';
import { ERROR_MESSAGES } from 'src/common/constants/error.constant';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll() {
    const cacheKey = KeyGenerator.generateListKey('student:all');
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) return cached;

    const students = await this.studentRepository.find();
    await this.cacheManager.set(cacheKey, students, 60);
    return students;
  }

  async findOne(id: number) {
    const cacheKey = KeyGenerator.generateStudentKey(id);
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) return cached;

    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new HttpException(
        ERROR_MESSAGES.STUDENT_GENERIC_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.cacheManager.set(cacheKey, student, 60);
    return student;
  }

  async findByEmail(email: string) {
    return this.studentRepository.findOne({ where: { email } });
  }

  async create(dto: CreateStudentDto) {
    const exist = await this.findByEmail(dto.email);
    if (exist) {
      throw new HttpException(
        ERROR_MESSAGES.USER_EMAIL_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const student = this.studentRepository.create({ email: dto.email });
    const saved = await this.studentRepository.save(student);

    await this.cacheManager.del(KeyGenerator.generateListKey('student:all'));

    return saved;
  }

  async suspend(email: string) {
    const student = await this.findByEmail(email);
    if (!student) {
      throw new HttpException(
        ERROR_MESSAGES.STUDENT_NOT_FOUND(email),
        HttpStatus.NOT_FOUND,
      );
    }

    if (student.isSuspended) {
      throw new HttpException(
        ERROR_MESSAGES.STUDENT_ALREADY_SUSPENDED(email),
        HttpStatus.BAD_REQUEST,
      );
    }

    const saved = await this.studentRepository.update(
      { id: student.id },
      { isSuspended: true },
    );

    await this.cacheManager.del(KeyGenerator.generateStudentKey(student.id));
    await this.cacheManager.del(KeyGenerator.generateListKey('student:all'));

    return saved;
  }

  async remove(id: number) {
    const student = await this.findOne(id);

    if (!student) {
      throw new HttpException(
        ERROR_MESSAGES.STUDENT_GENERIC_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.studentRepository.delete(id);

    await this.cacheManager.del(KeyGenerator.generateStudentKey(id));
    await this.cacheManager.del(KeyGenerator.generateListKey('student:all'));

    return { deleted: true };
  }

  async findByEmails(emails: string[]) {
    return this.studentRepository.find({
      where: {
        email: In(emails),
      },
    });
  }

  async findManyByEmails(emails: string[]) {
    if (!emails.length) return [];

    return this.studentRepository.find({
      where: { email: In(emails) },
    });
  }
}
