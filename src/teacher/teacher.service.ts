import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './teacher.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { KeyGenerator } from 'src/common/cache/key-generator.util';
import { ERROR_MESSAGES } from 'src/common/constants/error.constant';
import { CreateTeacherDto } from './dto/create-teacher.dto';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll() {
    const cacheKey = KeyGenerator.list('teacher:all');
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) return cached;

    const teachers = await this.teacherRepository.find();
    await this.cacheManager.set(cacheKey, teachers, 60);
    return teachers;
  }

  async findOne(id: number) {
    const cacheKey = KeyGenerator.teacher(id);
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) return cached;

    const teacher = await this.teacherRepository.findOne({ where: { id } });
    if (!teacher) {
      throw new HttpException(
        ERROR_MESSAGES.TEACHER_GENERIC_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.cacheManager.set(cacheKey, teacher, 60);
    return teacher;
  }

  async findByEmail(email: string) {
    return this.teacherRepository.findOne({ where: { email } });
  }

  async create(dto: CreateTeacherDto) {
    const exist = await this.findByEmail(dto.email);
    if (exist) {
      throw new HttpException(
        ERROR_MESSAGES.USER_EMAIL_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const teacher = this.teacherRepository.create({ email: dto.email });

    const saved = await this.teacherRepository.save(teacher);

    await this.cacheManager.del(KeyGenerator.list('teacher:all'));

    return saved;
  }

  async createIfNotExists(email: string) {
    let teacher = await this.findByEmail(email);

    if (!teacher) {
      teacher = this.teacherRepository.create({ email });
      teacher = await this.teacherRepository.save(teacher);

      await this.cacheManager.del(KeyGenerator.list('teacher:all'));
    }

    return teacher;
  }

  async remove(id: number) {
    await this.teacherRepository.delete(id);

    await this.cacheManager.del(KeyGenerator.teacher(id));
    await this.cacheManager.del(KeyGenerator.list('teacher:all'));

    return { deleted: true };
  }
}
