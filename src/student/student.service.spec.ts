import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './student.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException } from '@nestjs/common';
import { In } from 'typeorm';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockCache = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
});

describe('StudentService', () => {
  let service: StudentService;
  let repo: ReturnType<typeof mockRepository>;
  let cache: ReturnType<typeof mockCache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: getRepositoryToken(Student), useFactory: mockRepository },
        { provide: CACHE_MANAGER, useFactory: mockCache },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
    repo = module.get(getRepositoryToken(Student));
    cache = module.get(CACHE_MANAGER);
  });

  describe('findAll', () => {
    it('should return cached students', async () => {
      cache.get.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll();
      expect(result).toEqual([{ id: 1 }]);
      expect(repo.find).not.toHaveBeenCalled();
    });

    it('should fetch and cache students', async () => {
      cache.get.mockResolvedValue(null);
      repo.find.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll();
      expect(result).toEqual([{ id: 1 }]);
      expect(cache.set).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return cached student', async () => {
      cache.get.mockResolvedValue({ id: 1 });
      const result = await service.findOne(1);
      expect(result).toEqual({ id: 1 });
    });

    it('should throw if not found', async () => {
      cache.get.mockResolvedValue(null);
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(HttpException);
    });

    it('should fetch and cache student', async () => {
      cache.get.mockResolvedValue(null);
      repo.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findOne(1);
      expect(result).toEqual({ id: 1 });
      expect(cache.set).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should throw if email exists', async () => {
      repo.findOne.mockResolvedValue({ id: 1 });
      await expect(service.create({ email: 'a@test.com' })).rejects.toThrow(
        HttpException,
      );
    });

    it('should create new student', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue({ email: 'a@test.com' });
      repo.save.mockResolvedValue({ id: 1, email: 'a@test.com' });

      const result = await service.create({ email: 'a@test.com' });
      expect(result).toEqual({ id: 1, email: 'a@test.com' });
      expect(cache.del).toHaveBeenCalled();
    });
  });

  describe('suspend', () => {
    it('should throw if student not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.suspend('a@test.com')).rejects.toThrow(HttpException);
    });

    it('should throw if already suspended', async () => {
      repo.findOne.mockResolvedValue({ id: 1, email: 'a@test.com', isSuspended: true });
      await expect(service.suspend('a@test.com')).rejects.toThrow(HttpException);
    });

    it('should suspend student', async () => {
      repo.findOne.mockResolvedValue({ id: 1, email: 'a@test.com', isSuspended: false });
      repo.update.mockResolvedValue({ affected: 1 });

      const result = await service.suspend('a@test.com');
      expect(result).toEqual({ affected: 1 });
      expect(cache.del).toHaveBeenCalledTimes(2);
    });
  });

  describe('remove', () => {
    it('should throw if not found', async () => {
      cache.get.mockResolvedValue(null);
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(HttpException);
    });

    it('should delete student', async () => {
      cache.get.mockResolvedValue(null);
      repo.findOne.mockResolvedValue({ id: 1 });
      repo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      expect(result).toEqual({ deleted: true });
      expect(cache.del).toHaveBeenCalledTimes(2);
    });
  });

  describe('findByEmails', () => {
    it('should find many by emails', async () => {
      repo.find.mockResolvedValue([{ id: 1 }]);
      const result = await service.findByEmails(['a@test.com']);
      expect(repo.find).toHaveBeenCalledWith({
        where: { email: In(['a@test.com']) },
      });
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('findManyByEmails', () => {
    it('should return empty if no emails', async () => {
      const result = await service.findManyByEmails([]);
      expect(result).toEqual([]);
    });

    it('should find students', async () => {
      repo.find.mockResolvedValue([{ id: 1 }]);
      const result = await service.findManyByEmails(['a@test.com']);
      expect(repo.find).toHaveBeenCalledWith({
        where: { email: In(['a@test.com']) },
      });
      expect(result).toEqual([{ id: 1 }]);
    });
  });
});
