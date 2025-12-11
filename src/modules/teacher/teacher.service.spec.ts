import { Test, TestingModule } from '@nestjs/testing';
import { TeacherService } from './teacher.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Teacher } from './teacher.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('TeacherService', () => {
  let service: TeacherService;
  let repo: any;
  let cache: any;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherService,
        {
          provide: getRepositoryToken(Teacher),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCache,
        },
      ],
    }).compile();

    service = module.get<TeacherService>(TeacherService);
    repo = module.get(getRepositoryToken(Teacher));
    cache = module.get(CACHE_MANAGER);
  });

  describe('findAll', () => {
    it('returns cache when existed', async () => {
      cache.get.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll();
      expect(result).toEqual([{ id: 1 }]);
    });

    it('returns DB value when cache empty', async () => {
      cache.get.mockResolvedValue(null);
      repo.find.mockResolvedValue([{ id: 1 }]);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalled();
      expect(cache.set).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('findOne', () => {
    it('returns cache when existed', async () => {
      cache.get.mockResolvedValue({ id: 1 });
      const result = await service.findOne(1);
      expect(result).toEqual({ id: 1 });
    });

    it('returns DB result when not cached', async () => {
      cache.get.mockResolvedValue(null);
      repo.findOne.mockResolvedValue({ id: 1 });

      const result = await service.findOne(1);

      expect(result).toEqual({ id: 1 });
      expect(cache.set).toHaveBeenCalled();
    });

    it('throws NOT_FOUND error when teacher not found', async () => {
      cache.get.mockResolvedValue(null);
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(HttpException);

      await expect(service.findOne(1)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('create', () => {
    it('throws error if email exists', async () => {
      repo.findOne.mockResolvedValue({ id: 1, email: 'a@a.com' });

      await expect(
        service.create({ email: 'a@a.com' }),
      ).rejects.toThrow(HttpException);
    });

    it('creates a new teacher', async () => {
      repo.findOne.mockResolvedValue(null);

      repo.create.mockReturnValue({ email: 'a@a.com' });

      repo.save.mockResolvedValue({ id: 1, email: 'a@a.com' });

      const result = await service.create({ email: 'a@a.com' });

      expect(result).toEqual({ id: 1, email: 'a@a.com' });
      expect(cache.del).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes teacher and clears cache', async () => {
      repo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(repo.delete).toHaveBeenCalledWith(1);
      expect(cache.del).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ deleted: true });
    });
  });
});
