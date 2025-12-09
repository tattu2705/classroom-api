import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CommonStudentsQueryDto } from './dto/common-students.dto';
import { SuspendDto } from './dto/suspend.dto';
import { RetrieveForNotificationsDto } from './dto/retrieve-for-notifications';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SUCCESS_MESSAGES } from 'src/common/constants/success.constant';

@ApiTags('Registration')
@Controller()
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('/api/register')
  @HttpCode(204)
  @ApiBody({
    description: 'Register students to a teacher',
    schema: {
      example: {
        teacher: 'teacher1@gmail.com',
        students: ['student1@gmail.com', 'student2@gmail.com'],
      },
    },
  })
  @ApiNoContentResponse({
    description: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  async register(@Body() body: { teacher: string; students: string[] }) {
    return this.registrationService.register(body.teacher, body.students);
  }

  @Get('/api/commonstudents')
  @HttpCode(200)
  @ApiQuery({
    name: 'teacher',
    description:
      'List of teacher emails. Use multiple query parameters: ?teacher=a@gmail.com&teacher=b@gmail.com',
    required: true,
    isArray: true,
    type: [String],
  })
  @ApiOkResponse({
    description: 'List of common students across the given teachers.',
    schema: {
      example: {
        students: ['student1@gmail.com', 'student2@gmail.com'],
      },
    },
  })
  async getCommonStudents(@Query() query: CommonStudentsQueryDto) {
    return await this.registrationService.getCommonStudentsByTeachers(
      query.teacher,
    );
  }

  @Post('/api/suspend')
  @HttpCode(204)
  @ApiBody({
    description: 'Suspend a student from receiving notifications',
    schema: {
      example: {
        student: 'student1@gmail.com',
      },
    },
  })
  @ApiNoContentResponse({
    description: SUCCESS_MESSAGES.SUSPENDED_SUCCESS('example@gmail.com'),
  })
  @ApiBody({
    description: 'Suspend a student from receiving notifications',
    type: SuspendDto,
  })
  async suspendStudent(@Body() body: SuspendDto) {
    return await this.registrationService.suspendStudent(body.student);
  }

  @Post('/api/retrievefornotifications')
  @HttpCode(200)
  @ApiBody({
    description: 'Retrieve recipients for a notification.',
    type: RetrieveForNotificationsDto,
    examples: {
      default: {
        value: {
          teacher: 'teacher1@gmail.com',
          notification: 'Hello class! @student2@gmail.com',
        },
      },
    },
  })
  async retrieveForNotifications(@Body() body: RetrieveForNotificationsDto) {
    return await this.registrationService.retrieveNotificationReceipients(
      body.teacher,
      body.notification,
    );
  }
}
