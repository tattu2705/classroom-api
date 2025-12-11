import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ERROR_MESSAGES } from 'src/shared/constants/error.constant';
import { Teacher } from './teacher.entity';

@ApiTags('Teacher')
@Controller()
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get('/api/teachers')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'List of all teachers',
    schema: {
      example: [
        {
          id: 1,
          email: 'teacher1@gmail.com',
        },
        {
          id: 2,
          email: 'teacher2@gmail.com',
        },
      ],
    },
  })
  async getTeachers(): Promise<Teacher[]> {
    return this.teacherService.findAll();
  }

  @Get('/api/teachers/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    description: 'Teacher ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Teacher details',
    schema: {
      example: {
        id: 1,
        email: 'teacher1@gmail.com',
      },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_MESSAGES.TEACHER_NOT_FOUND('example@gmail.com'),
  })
  async getTeacherById(@Param('id') id: number): Promise<Teacher> {
    return this.teacherService.findOne(id);
  }

  @Post('/api/teachers')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiBody({
    type: CreateTeacherDto,
    description: 'Create a new teacher',
    examples: {
      valid: {
        value: {
          email: 'teacher1@gmail.com',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Teacher created successfully',
    schema: {
      example: {
        id: 1,
        email: 'teacher1@gmail.com',
      },
    },
  })
  async createTeacher(@Body() dto: CreateTeacherDto): Promise<Teacher> {
    return this.teacherService.create(dto);
  }
  @Delete('/api/teachers/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    description: 'Teacher ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Teacher deleted successfully',
    schema: {
      example: {
        message: 'Teacher removed successfully.',
      },
    },
  })

  async deleteTeacher(@Param('id') id: number) {
    return this.teacherService.remove(id);
  }
}
