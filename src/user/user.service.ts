import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { KeyGenerator } from 'src/common/cache/key-generator.util';
import { ERROR_MESSAGES } from 'src/common/constants/error.constant';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(): Promise<User[]> {
    const key = KeyGenerator.userAll();
    const cached = await this.cacheManager.get<User[]>(key);

    if (cached) {
      return cached;
    }

    const users = await this.userRepository.find();
    await this.cacheManager.set(key, users, 100000);
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    const key = KeyGenerator.user(id);
    const cached = await this.cacheManager.get<User>(key);
    if (cached) return cached;
    const user = await this.userRepository.findOneBy({ id });
    if (user) {
      await this.cacheManager.set(key, user, 100000);
    }
    return user;
  }

  async create(user: Partial<User>): Promise<User | { message: string }> {
    const email = user.email?.toLowerCase();
    const exist = await this.userRepository.findOneBy({ email });
    if (exist) {
      throw new HttpException(
        ERROR_MESSAGES.USER_EMAIL_EXISTS,
        HttpStatus.CONFLICT,
      );
    }
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id).then((res) => {
      return res.affected;
    });
  }
}
