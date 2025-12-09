export class KeyGenerator {
  static generateUserAllKey() {
    return 'user:all';
  }

  static generateTeacherKey(id: number | string) {
    return `teacher:${id}`;
  }

  static generateStudentKey(id: number | string) {
    return `student:${id}`;
  }

  static generateListKey(prefix: string, extra?: string | number) {
    return extra ? `${prefix}:${extra}` : prefix;
  }

  static generateCustomKey(
    ...parts: (string | number | boolean | undefined)[]
  ) {
    return parts.filter(Boolean).join(':');
  }
}
