import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationService } from './registration.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TeacherStudent } from './teacher-student.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, NotFoundException } from '@nestjs/common';
import { StudentService } from 'src/modules/student/student.service';
import { TeacherService } from 'src/modules/teacher/teacher.service';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let repo: any;
  let studentService: any;
  let teacherService: any;
  let cache: any;

  beforeEach(async () => {
    const mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      insert: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockStudent = {
      findByEmail: jest.fn(),
      findByEmails: jest.fn(),
      findManyByEmails: jest.fn(),
      suspend: jest.fn(),
    };

    const mockTeacher = {
      findByEmail: jest.fn(),
    };

    const mockCache = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: getRepositoryToken(TeacherStudent), useValue: mockRepo },
        { provide: StudentService, useValue: mockStudent },
        { provide: TeacherService, useValue: mockTeacher },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
    repo = module.get(getRepositoryToken(TeacherStudent));
    studentService = module.get(StudentService);
    teacherService = module.get(TeacherService);
    cache = module.get(CACHE_MANAGER);
  });

  describe('register', () => {
    it('throws if teacher not found', async () => {
      teacherService.findByEmail.mockResolvedValue(null);

      await expect(
        service.register('t@a.com', ['s@b.com']),
      ).rejects.toThrow(HttpException);
    });

    it('throws if some student emails do not exist', async () => {
      teacherService.findByEmail.mockResolvedValue({ id: 1 });
      studentService.findByEmails.mockResolvedValue([{ id: 10, email: 'a@a.com' }]);

      await expect(
        service.register('t@a.com', ['a@a.com', 'b@b.com']),
      ).rejects.toThrow(HttpException);
    });

    it('throws if student already registered', async () => {
      teacherService.findByEmail.mockResolvedValue({ id: 1 });
      studentService.findByEmails.mockResolvedValue([
        { id: 11, email: 'a@a.com' },
      ]);

      repo.find.mockResolvedValue([{ studentId: 11 }]);

      await expect(
        service.register('t@a.com', ['a@a.com']),
      ).rejects.toThrow(HttpException);
    });

    it('creates new registrations', async () => {
      teacherService.findByEmail.mockResolvedValue({ id: 1 });
      studentService.findByEmails.mockResolvedValue([
        { id: 11, email: 'a@a.com' },
      ]);

      repo.find.mockResolvedValue([]);
      repo.insert.mockResolvedValue({});

      const result = await service.register('t@a.com', ['a@a.com']);

      expect(result).toEqual({ message: expect.any(String) });
      expect(repo.insert).toHaveBeenCalled();
    });
  });

  describe('getCommonStudentsByTeachers', () => {
    it('returns cached data', async () => {
      cache.get.mockResolvedValue(['a@a.com']);

      const result = await service.getCommonStudentsByTeachers(['t@a.com']);

      expect(result).toEqual({ students: ['a@a.com'] });
    });

    it('throws when teacher not found', async () => {
      cache.get.mockResolvedValue(null);
      teacherService.findByEmail.mockResolvedValue(null);

      await expect(
        service.getCommonStudentsByTeachers(['t@a.com']),
      ).rejects.toThrow(HttpException);
    });

    it('returns emails from queryBuilder', async () => {
      cache.get.mockResolvedValue(null);
      teacherService.findByEmail.mockResolvedValue({ id: 1 });

      const mockQB = {
        select: () => mockQB,
        innerJoin: () => mockQB,
        where: () => mockQB,
        groupBy: () => mockQB,
        having: () => mockQB,
        getRawMany: jest.fn().mockResolvedValue([{ email: 'x@y.com' }]),
      };

      repo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.getCommonStudentsByTeachers(['t@a.com']);

      expect(result).toEqual({ students: ['x@y.com'] });
      expect(cache.set).toHaveBeenCalled();
    });
  });

  describe('suspendStudent', () => {
    it('throws if student not found', async () => {
      studentService.findByEmail.mockResolvedValue(null);

      await expect(
        service.suspendStudent('a@a.com'),
      ).rejects.toThrow(HttpException);
    });

    it('suspends student', async () => {
      studentService.findByEmail.mockResolvedValue({ id: 1 });

      const result = await service.suspendStudent('a@a.com');

      expect(result.message).toContain('has been suspended');
      expect(studentService.suspend).toHaveBeenCalledWith('a@a.com');
    });
  });

  describe('retrieveNotificationReceipients', () => {
    it('returns cached result', async () => {
      cache.get.mockResolvedValue({ receipients: ['a@a.com'] });

      const result = await service.retrieveNotificationReceipients(
        't@a.com',
        'hello',
      );

      expect(result).toEqual({ receipients: ['a@a.com'] });
    });

    it('throws if teacher not found', async () => {
      cache.get.mockResolvedValue(null);
      teacherService.findByEmail.mockResolvedValue(null);

      await expect(
        service.retrieveNotificationReceipients('t@a.com', 'hello'),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns recipients from registered + mentions', async () => {
      cache.get.mockResolvedValue(null);

      teacherService.findByEmail.mockResolvedValue({ id: 1 });

      const mockQB = {
        innerJoinAndSelect: () => mockQB,
        where: () => mockQB,
        andWhere: () => mockQB,
        getMany: jest.fn().mockResolvedValue([
          { student: { email: 'reg@a.com' } },
        ]),
      };
      repo.createQueryBuilder.mockReturnValue(mockQB);

      studentService.findManyByEmails.mockResolvedValue([
        { email: 'men@b.com', isSuspended: false },
      ]);

      const result = await service.retrieveNotificationReceipients(
        't@a.com',
        'hello @men@b.com',
      ) as { receipients: string[] };

      expect(result.receipients).toContain('reg@a.com');
      expect(result.receipients).toContain('men@b.com');
      expect(cache.set).toHaveBeenCalled();
    });
  });
});
