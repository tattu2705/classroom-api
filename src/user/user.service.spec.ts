import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let repo: Repository<User>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'student',
    status: 'active',
  };

  const mockRepository = {
    find: jest.fn().mockResolvedValue([mockUser]),
    findOneBy: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockReturnValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all users', async () => {
    const users = await service.findAll();
    expect(users).toEqual([mockUser]);
    expect(repo.find).toHaveBeenCalled();
  });

  it('should return a single user', async () => {
    const user = await service.findOne(1);
    expect(user).toEqual(mockUser);
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('should create a new user', async () => {
    const userData = { email: 'new@example.com', role: 'teacher' };
    const user = await service.create(userData);
    expect(repo.create).toHaveBeenCalledWith(userData);
    expect(repo.save).toHaveBeenCalledWith(mockUser);
    expect(user).toEqual(mockUser);
  });

  it('should delete a user', async () => {
    await service.remove(1);
    expect(repo.delete).toHaveBeenCalledWith(1);
  });
});
