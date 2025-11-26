import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
// import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/api/users')
  async getUsers() {
    return this.userService.findAll();
  }

  @Post('/api/users')
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Delete('/api/users/:id')
  async deleteUser(@Param('id') id: number) {
    return this.userService.remove(id);
  }
}
