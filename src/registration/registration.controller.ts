import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CommonStudentsQueryDto } from './dto/common-students.dto';
import { SuspendDto } from './dto/suspend.dto';
import { RetrieveForNotificationsDto } from './dto/retrieve-for-notifications';

@Controller()
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('/api/register')
  @HttpCode(204)
  async register(@Body() body: { teacher: string; students: string[] }) {
    return this.registrationService.register(body.teacher, body.students);
  }

  @Get('/api/commonstudents')
  @HttpCode(200)
  async getCommonStudents(@Query() query: CommonStudentsQueryDto) {
    return await this.registrationService.getCommonStudentsByTeachers(
      query.teacher,
    );
  }

  @Post('/api/suspend')
  @HttpCode(204)
  async suspendStudent(@Body() body: SuspendDto) {
    return await this.registrationService.suspendStudent(body.student);
  }

  @Post('/api/retrievefornotifications')
  @HttpCode(200)
  async retrieveForNotifications(@Body() body: RetrieveForNotificationsDto) {
    return await this.registrationService.retrieveNotificationRecipients(
      body.teacher,
      body.notification,
    );
  }
}
