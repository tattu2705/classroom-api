# NestJS Teacher-Student API

This repository contains a NestJS API for managing teachers, students, and notifications. The API supports teacher-student registration, retrieving common students, suspending students, and sending notifications.

---

## Hosted API

(Insert your deployed URL here)

---

## Features

### 1. Register Students to a Teacher

**POST** `/api/register`

**Request body:**

```json
{
  "teacher": "teacherken@gmail.com",
  "students": ["studentjon@gmail.com", "studenthon@gmail.com"]
}
```

---

### 2. Retrieve Common Students

**GET** `/api/commonstudents?teacher=teacherken@gmail.com`

Supports multiple teachers:

```
/api/commonstudents?teacher=teacherken@gmail.com&teacher=teacherjoe@gmail.com
```

---

### 3. Suspend a Student

**POST** `/api/suspend`

**Request body:**

```json
{
  "student": "studentagnes@gmail.com"
}
```

---

### 4. Retrieve Notification Recipients

**POST** `/api/retrievefornotifications`

**Request body:**

```json
{
  "teacher": "teacherken@gmail.com",
  "notification": "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com"
}
```

---

### 5. User Management (Optional / Admin)

* **GET** `/api/users` – Retrieve all users
* **POST** `/api/users` – Create a new user
* **DELETE** `/api/users/:id` – Delete a user by ID

---

## Project Structure

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

## Technologies Used

* **NestJS**
* **MySQL + TypeORM**
* **Node.js (>= 20.x)**
* **TypeScript**

---

## Running Locally

### Prerequisites

* Node.js >= 20.x
* npm >= 9.x
* MySQL or another TypeORM-supported database

### 1. Clone the repository

```bash
git clone https://github.com/tattu2705/classroom-api.git
cd classroom-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=yourpassword
DB_NAME=your_database_name
PORT=3000
```

### 4. Start the server

```bash
# Development (hot reload)
npm run start:dev

# Production
npm run start:prod
```

---

## License

MIT
