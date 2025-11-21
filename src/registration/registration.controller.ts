import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RegistrationService } from './registration.service';

@Controller()
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('/api/register')
  async register(@Body() body: { teacher: string; students: string[] }) {
    return this.registrationService.register(body.teacher, body.students);
  }

  @Get('/api/commonstudents')
  async getCommonStudents(@Query('teacher') teachers: string | string[]) {
    const teacherList = Array.isArray(teachers) ? teachers : [teachers];

    return await this.registrationService.getCommonStudentsByTeachers(
      teacherList,
    );
  }

  @Post('/api/suspend')
  async suspendStudent(@Body() body: { student: string }) {
    return await this.registrationService.suspendStudent(body.student);
  }

  @Post('/api/retrievefornotifications')
  async retrieveForNotifications(
    @Body() body: { teacher: string; notification: string },
  ) {
    return await this.registrationService.retrieveNotificationRecipients(
      body.teacher,
      body.notification,
    );
  }
}
