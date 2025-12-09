import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { ERROR_MESSAGES } from 'src/common/constants/error.constant';

@ApiTags('Student')
@Controller()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('/api/students')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'List of all students',
    schema: {
      example: [
        {
          id: 1,
          email: 'student1@gmail.com',
          isSuspended: false,
        },
        {
          id: 2,
          email: 'student2@gmail.com',
          isSuspended: true,
        },
      ]
    }
  })
  async getStudents() {
    return this.studentService.findAll();
  }

  @Get('/api/students/:id')
  @HttpCode(200)
  @ApiParam({
    name: 'id',
    description: 'Student ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Student details',
    schema: {
      example: {
        id: 1,
        email: 'student1@gmail.com',
        isSuspended: false,
      }
    }
  })
  @ApiNotFoundResponse({
    description: ERROR_MESSAGES.STUDENT_NOT_FOUND("example@gmail.com")
  })
  async getStudentById(@Param('id') id: number) {
    return this.studentService.findOne(id);
  }

  @Post('/api/students')
  @HttpCode(201)
  @ApiBody({
    type: CreateStudentDto,
    description: 'Create a new student',
    examples: {
      valid: {
        value: {
          email: 'student1@gmail.com'
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'The student has been successfully created.',
  })

  async createStudent(@Body() dto: CreateStudentDto) {
    return this.studentService.create(dto);
  }

  @Delete('/api/students/:id')
  @HttpCode(200)
  @ApiParam({
    name: 'id',
    description: 'Student ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'The student has been successfully deleted.',
  })

  @ApiNotFoundResponse({
    description: ERROR_MESSAGES.STUDENT_GENERIC_NOT_FOUND
  })
  async deleteStudent(@Param('id') id: number) {
    return this.studentService.remove(id);
  }
}
