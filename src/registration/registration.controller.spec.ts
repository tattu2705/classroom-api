import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';

describe('RegistrationController', () => {
  let controller: RegistrationController;
  let service: RegistrationService;

  const mockRegistrationService = {
    register: jest.fn(),
    getCommonStudentsByTeachers: jest.fn(),
    suspendStudent: jest.fn(),
    retrieveNotificationRecipients: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationController],
      providers: [
        {
          provide: RegistrationService,
          useValue: mockRegistrationService,
        },
      ],
    }).compile();

    controller = module.get<RegistrationController>(RegistrationController);
    service = module.get<RegistrationService>(RegistrationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('/api/register', () => {
    it('should call register service with teacher and students', async () => {
      const body = {
        teacher: 'teacher@example.com',
        students: ['s1@mail.com'],
      };
      mockRegistrationService.register.mockResolvedValue({ success: true });

      const result = await controller.register(body);

      expect(service.register).toHaveBeenCalledWith('teacher@example.com', [
        's1@mail.com',
      ]);
      expect(result).toEqual({ success: true });
    });
  });

  describe('/api/commonstudents', () => {
    it('should call service with a list of teachers (single)', async () => {
      mockRegistrationService.getCommonStudentsByTeachers.mockResolvedValue({
        students: ['a@gmail.com'],
      });

      const result = await controller.getCommonStudents('teacherA@gmail.com');

      expect(service.getCommonStudentsByTeachers).toHaveBeenCalledWith([
        'teacherA@gmail.com',
      ]);
      expect(result).toEqual({ students: ['a@gmail.com'] });
    });

    it('should call service with multiple teachers', async () => {
      const teachers = ['t1@mail.com', 't2@mail.com'];

      mockRegistrationService.getCommonStudentsByTeachers.mockResolvedValue({
        students: ['x@mail.com'],
      });

      const result = await controller.getCommonStudents(teachers);

      expect(service.getCommonStudentsByTeachers).toHaveBeenCalledWith(
        teachers,
      );
      expect(result).toEqual({ students: ['x@mail.com'] });
    });
  });

  describe('/api/suspend', () => {
    it('should call suspend service with student email', async () => {
      mockRegistrationService.suspendStudent.mockResolvedValue({
        success: true,
      });

      const body = { student: 'student@mail.com' };
      const result = await controller.suspendStudent(body);

      expect(service.suspendStudent).toHaveBeenCalledWith('student@mail.com');
      expect(result).toEqual({ success: true });
    });
  });

  describe('/api/retrievefornotifications', () => {
    it('should call service with teacher + notification', async () => {
      const body = {
        teacher: 'teacher@mail.com',
        notification: 'Hello @student@mail.com',
      };

      mockRegistrationService.retrieveNotificationRecipients.mockResolvedValue({
        recipients: ['student@mail.com'],
      });

      const result = await controller.retrieveForNotifications(body);

      expect(service.retrieveNotificationRecipients).toHaveBeenCalledWith(
        'teacher@mail.com',
        'Hello @student@mail.com',
      );

      expect(result).toEqual({
        recipients: ['student@mail.com'],
      });
    });
  });
});
