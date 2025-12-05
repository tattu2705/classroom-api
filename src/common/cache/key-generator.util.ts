// src/common/cache/key-generator.util.ts

export class KeyGenerator {
  static userAll() {
    return 'user:all';
  }

  static user(id: number | string) {
    return `user:${id}`;
  }

  static teacher(id: number | string) {
    return `teacher:${id}`;
  }

  static student(id: number | string) {
    return `student:${id}`;
  }

  static list(prefix: string, extra?: string | number) {
    return extra ? `${prefix}:${extra}` : prefix;
  }

  static custom(...parts: (string | number | boolean | undefined)[]) {
    return parts.filter(Boolean).join(':');
  }
}
