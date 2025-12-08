import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';

@Controller()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('/api/students')
  async getStudents() {
    return this.studentService.findAll();
  }

  @Get('/api/students/:id')
  async getStudentById(@Param('id') id: number) {
    return this.studentService.findOne(id);
  }

  @Post('/api/students')
  async createStudent(@Body() dto: CreateStudentDto) {
    return this.studentService.create(dto);
  }

  @Delete('/api/students/:id')
  async deleteStudent(@Param('id') id: number) {
    return this.studentService.remove(id);
  }
}
