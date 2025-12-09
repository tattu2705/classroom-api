export const ERROR_MESSAGES = {
  TEACHER_NOT_FOUND: (email: string) => `Teacher with email ${email} not found`,

  STUDENT_NOT_FOUND: (email: string) => `Student with email ${email} not found`,

  STUDENT_ALREADY_REGISTERED: (studentEmail: string, teacherEmail: string) =>
    `Student with email ${studentEmail} is already registered under teacher with email ${teacherEmail}`,

  STUDENT_ALREADY_SUSPENDED: (email: string) =>
    `Student with email ${email} is already suspended`,
  USER_EMAIL_EXISTS: 'User with this email already exists',

  TEACHER_GENERIC_NOT_FOUND: 'Teacher not found',

  STUDENT_GENERIC_NOT_FOUND: 'Student not found',

  TOO_MANY_MENTIONS: (max: number) =>
    `Too many mentioned students in notification. Maximum allowed is ${max}`,
};
