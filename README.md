# NestJS Teacher-Student API

This repository contains a NestJS API for managing teachers, students, and notifications. The API supports teacher-student registration, retrieving common students, suspending students, and sending notifications.

---

## Hosted API

If deployed, you can access the API at:  
**[http://47.129.117.76](http://47.129.117.76)**

---

## Features

1. **Register Students to a Teacher**
   - **POST** `/api/register`
   - Request body:
     ```json
     {
       "teacher": "teacherken@gmail.com",
       "students": ["studentjon@gmail.com", "studenthon@gmail.com"]
     }
     ```

2. **Retrieve Common Students**
   - **GET** `/api/commonstudents?teacher=teacherken@gmail.com`
   - Can accept multiple teachers:  
     `/api/commonstudents?teacher=teacherken@gmail.com&teacher=teacherjoe@gmail.com`

3. **Suspend a Student**
   - **POST** `/api/suspend`
   - Request body:
     ```json
     {
       "student": "studentagnes@gmail.com"
     }
     ```

4. **Retrieve Notification Recipients**
   - **POST** `/api/retrievefornotifications`
   - Request body:
     ```json
     {
       "teacher": "teacherken@gmail.com",
       "notification": "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com"
     }
     ```

5. **User Management (Optional / Admin)**
   - **GET** `/api/users` – Retrieve all users
   - **POST** `/api/users` – Create a new user
   - **DELETE** `/api/users/:id` – Delete a user by ID

---

## Running Locally

### Prerequisites

- Node.js >= 20.x
- npm >= 9.x
- MySQL (or another database supported by TypeORM)

### Steps

1. Clone the repository:

```bash
git clone https://github.com/tattu2705/classroom-api.git
cd <folder>
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Create a .env file in the root directory with the following example:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=yourpassword
DB_NAME=your_database_name
PORT=3000
```

4. Start the server:

```bash
# For development (watch mode)
npm run start:dev

# For production
npm run start:prod
```
