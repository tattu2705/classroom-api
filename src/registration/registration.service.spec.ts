import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationService } from './registration.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { TeacherStudent } from './teacher-student.entity';
import { NotFoundException } from '@nestjs/common';

describe('RegistrationService', () => {
  let service: RegistrationService;

  const mockTeacher = { id: 1, email: 't1@mail.com', role: 'teacher' };
  const mockStudent1 = {
    id: 2,
    email: 's1@mail.com',
    role: 'student',
    status: 'active',
  };
  const mockStudent2 = {
    id: 3,
    email: 's2@mail.com',
    role: 'student',
    status: 'active',
  };

  const userRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  const regRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(TeacherStudent), useValue: regRepo },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);

    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------
  // register()
  // ---------------------------------------------------------------------
  describe('register', () => {
    it('should return error if teacher not found', async () => {
      userRepo.findOne.mockResolvedValueOnce(null);

      const result = await service.register('t1@mail.com', ['s1@mail.com']);
      expect(result.success).toBe(false);
    });

    it('should throw NotFoundException if a student not found', async () => {
      userRepo.findOne
        .mockResolvedValueOnce(mockTeacher) // teacher
        .mockResolvedValueOnce(null); // missing student

      await expect(
        service.register('t1@mail.com', ['s1@mail.com']),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return error if student already registered', async () => {
      userRepo.findOne
        .mockResolvedValueOnce(mockTeacher)
        .mockResolvedValueOnce(mockStudent1);

      regRepo.findOne.mockResolvedValueOnce({}); // already exists

      const result = await service.register('t1@mail.com', ['s1@mail.com']);
      expect(result.success).toBe(false);
      expect(result.message).toContain('already registered');
    });

    it('should register students successfully', async () => {
      userRepo.findOne
        .mockResolvedValueOnce(mockTeacher)
        .mockResolvedValueOnce(mockStudent1);

      regRepo.findOne.mockResolvedValueOnce(null);
      regRepo.save.mockResolvedValueOnce({});

      const result = await service.register('t1@mail.com', ['s1@mail.com']);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Registration successful');
    });
  });

  // ---------------------------------------------------------------------
  // getCommonStudentsByTeachers()
  // ---------------------------------------------------------------------
  describe('getCommonStudentsByTeachers', () => {
    it('should return error if teachers not found', async () => {
      userRepo.find.mockResolvedValueOnce([]);

      const result = await service.getCommonStudentsByTeachers(['t@mail.com']);
      expect(result.success).toBe(false);
    });

    it('should return list of common students', async () => {
      userRepo.find.mockResolvedValueOnce([mockTeacher]);

      const qb: any = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        getRawMany: jest
          .fn()
          .mockResolvedValue([
            { email: 's1@mail.com' },
            { email: 's2@mail.com' },
          ]),
      };
      regRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getCommonStudentsByTeachers(['t@mail.com']);
      expect(result.students).toEqual(['s1@mail.com', 's2@mail.com']);
    });
  });

  // ---------------------------------------------------------------------
  // suspendStudent()
  // ---------------------------------------------------------------------
  describe('suspendStudent', () => {
    it('should return error when student not found', async () => {
      userRepo.findOne.mockResolvedValueOnce(null);

      const result = await service.suspendStudent('s1@mail.com');
      expect(result.success).toBe(false);
    });

    it('should suspend student successfully', async () => {
      userRepo.findOne.mockResolvedValueOnce(mockStudent1);
      userRepo.save.mockResolvedValueOnce({
        ...mockStudent1,
        status: 'suspended',
      });

      const result = await service.suspendStudent('s1@mail.com');
      expect(result.success).toBe(true);
    });
  });

  // ---------------------------------------------------------------------
  // retrieveNotificationRecipients()
  // ---------------------------------------------------------------------
  describe('retrieveNotificationRecipients', () => {
    it('should return error if teacher not found', async () => {
      userRepo.findOne.mockResolvedValueOnce(null);

      const result = await service.retrieveNotificationRecipients(
        't@mail.com',
        'msg',
      );
      expect(result.message).toContain('not found');
    });

    it('should return registered active students only', async () => {
      userRepo.findOne.mockResolvedValueOnce(mockTeacher);

      const qb: any = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ student: mockStudent1 }]),
      };
      regRepo.createQueryBuilder.mockReturnValue(qb);

      userRepo.findOne.mockResolvedValueOnce(mockStudent2);

      const result = await service.retrieveNotificationRecipients(
        't@mail.com',
        '@s2@mail.com hello',
      );

      expect(result.receipients).toEqual(['s1@mail.com', 's2@mail.com']);
    });

    it('should ignore suspended mentioned students', async () => {
      userRepo.findOne.mockResolvedValueOnce(mockTeacher);

      const qb: any = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      regRepo.createQueryBuilder.mockReturnValue(qb);

      userRepo.findOne.mockResolvedValueOnce(null); // mentioned student inactive

      const result = await service.retrieveNotificationRecipients(
        't@mail.com',
        '@inactive@mail.com',
      );

      expect(result.receipients).toEqual([]);
    });
  });
});
