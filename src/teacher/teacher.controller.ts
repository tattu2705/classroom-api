import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';

@Controller()
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get('/api/teachers')
  async getTeachers() {
    return this.teacherService.findAll();
  }

  @Get('/api/teachers/:id')
  async getTeacherById(@Param('id') id: number) {
    return this.teacherService.findOne(id);
  }

  @Post('/api/teachers')
  async createTeacher(@Body() dto: CreateTeacherDto) {
    return this.teacherService.create(dto);
  }

  @Delete('/api/teachers/:id')
  async deleteTeacher(@Param('id') id: number) {
    return this.teacherService.remove(id);
  }
}
