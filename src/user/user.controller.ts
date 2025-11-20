import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/api/users')
  async getUsers() {
    return this.userService.findAll();
  }

  @Post('/api/users')
  async createUser(@Body() userData: Partial<User>) {
    return this.userService.create(userData);
  }

  @Delete('/api/users/:id')
  async deleteUser(@Param('id') id: number) {
    return this.userService.remove(id);
  }
}
