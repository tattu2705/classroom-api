# NestJS Teacher-Student API

This repository contains a **NestJS API** for managing teachers, students, registrations, suspensions, and notifications.

---

## 🚀 Hosted API

**Swagger UI:**

```
<your-host>/api
```

**Postman Collection:**

```
https://tattunguyen2705-4304537.postman.co/workspace/MyTeam's-Workspace~eb6a3734-7aa4-45a0-8daf-5692a1a13bf6/collection/50700895-62ab517b-26fc-4be8-a020-30b1710238fe?action=share&creator=50700895
```

---

## ✨ Features

### 1. Register Students to a Teacher

**POST** `/api/register`

```json
{
  "teacher": "teacherken@gmail.com",
  "students": ["studentjon@gmail.com", "studenthon@gmail.com"]
}
```

---

### 2. Retrieve Common Students

**GET** `/api/commonstudents?teacher=teacherken@gmail.com`

```
/api/commonstudents?teacher=teacherken@gmail.com&teacher=teacherjoe@gmail.com
```

---

### 3. Suspend a Student

**POST** `/api/suspend`

```json
{
  "student": "studentagnes@gmail.com"
}
```

---

### 4. Retrieve Notification Recipients

**POST** `/api/retrievefornotifications`

```json
{
  "teacher": "teacherken@gmail.com",
  "notification": "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com"
}
```

---

### 5. Optional User Management

* **GET** `/api/users`
* **POST** `/api/users`
* **DELETE** `/api/users/:id`

---

## 📦 Project Structure

```
src/
 ├── teachers/
 ├── students/
 ├── notifications/
 ├── users/ (optional)
 ├── app.module.ts
 ├── main.ts
```

---

## 🛠 Technologies

* NestJS
* MySQL + TypeORM
* Docker + Docker Compose
* Node.js 20+
* TypeScript

---

## 🐳 Running with Docker

### 1. Build the image

```bash
docker build -t classroom-api .
```

### 2. Run container

```bash
docker run -p 3000:3000 --env-file .env classroom-api
```

### 3. Docker Compose

```bash
docker compose up --build
```

---

## 💻 Running Locally (Non‑Docker)

### Prerequisites

* Node.js >= 20.x
* npm >= 9.x
* MySQL

### 1. Clone repository

```bash
git clone https://github.com/tattu2705/classroom-api.git
cd classroom-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env`

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=yourpassword
DB_NAME=your_database_name
PORT=3000
```

### 4. Start

Development:

```bash
npm run start:dev
```

Production:

```bash
npm run start:prod
```

---

## 📘 API Documentation

Detailed API documentation available at Swagger UI:

```
<your-host>/api
```

Postman Collection available here:

```
https://tattunguyen2705-4304537.postman.co/workspace/MyTeam's-Workspace~eb6a3734-7aa4-45a0-8daf-5692a1a13bf6/collection/50700895-62ab517b-26fc-4be8-a020-30b1710238fe?action=share&creator=50700895
```

---

## 📄 License

MIT
