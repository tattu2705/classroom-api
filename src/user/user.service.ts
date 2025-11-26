import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async create(user: Partial<User>): Promise<User | { message: string }> {
    const email = user.email?.toLowerCase();
    const exist = await this.userRepository.findOneBy({ email });
    if (exist) {
      throw new Error('User with this email already exists');
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
