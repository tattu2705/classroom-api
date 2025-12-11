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

  async findAll(): Promise<Teacher[]> {
    const cacheKey = KeyGenerator.generateListKey('teacher:all');
    const cached = await this.cacheManager.get<Teacher[]>(cacheKey);

    if (cached) return cached;

    const teachers = await this.teacherRepository.find();
    await this.cacheManager.set(cacheKey, teachers, 60);
    return teachers;
  }

  async findOne(id: number): Promise<Teacher> {
    const cacheKey = KeyGenerator.generateTeacherKey(id);
    const cached = await this.cacheManager.get<Teacher>(cacheKey);

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

  async findByEmail(email: string): Promise<Teacher | null> {
    return this.teacherRepository.findOne({ where: { email } });
  }

  async create(dto: CreateTeacherDto): Promise<Teacher> {
    const exist = await this.findByEmail(dto.email);
    if (exist) {
      throw new HttpException(
        ERROR_MESSAGES.USER_EMAIL_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const teacher = this.teacherRepository.create({ email: dto.email });

    const saved = await this.teacherRepository.save(teacher);

    await this.cacheManager.del(KeyGenerator.generateListKey('teacher:all'));

    return saved;
  }

  async remove(id: number): Promise<{deleted: boolean}> {
    await this.teacherRepository.delete(id);

    await this.cacheManager.del(KeyGenerator.generateTeacherKey(id));
    await this.cacheManager.del(KeyGenerator.generateListKey('teacher:all'));

    return { deleted: true };
  }
}
