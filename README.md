# Student Tracker API Documentation

## Logic & Flow
The application is designed with Role-Based Access Control (RBAC). 
1.  **Admin**: Manages users, has full oversight of the system.
2.  **Mentor**: Manages assignments, sessions, approves attendance, and tracks student progress.
3.  **Student**: Submits assignments, marks attendance, logs learning time, and tracks their own progress.

## Base URL
`http://localhost:5000/api`

## How to Test in Postman

1.  **Authentication**:
    *   The API uses **cookies** (`accessToken`, `refreshToken`) for session management.
    *   **Postman handles cookies automatically**. Once you call the `/login` endpoint, the cookies are stored in Postman's cookie jar and sent with subsequent requests.
    *   **Setup**: Create an environment in Postman and set `url` to `http://localhost:5000/api`.

2.  **Headers**:
    *   For `POST`, `PUT`, `PATCH` requests, usually set `Content-Type`: `application/json`.

3.  **Workflow**:
    *   Register an Admin first (`POST /admin`).
    *   Login as Admin (`POST /login`).
    *   Use Admin token to create Students and Mentors (`POST /students`, `POST /mentors`).
    *   Login as Student/Mentor to test their specific routes. Note: Login overwrites the cookies.

---

## 1. Authentication (All Roles)

| Method | Endpoint | Role | Description | Body (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/admin` | Any | Register the first Admin | `{"name": "Admin", "email": "admin@test.com", "password": "123"}` |
| `POST` | `/login` | Any | Login and receive cookies | `{"email": "...", "password": "..."}` |
| `POST` | `/logout` | Any | Clear cookies | - |

---

## 2. User Management (Admin Only)

**Prefix:** `/api`

| Method | Endpoint | Role | Description | Body (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/students` | **Admin** | Create a Student account | `{"name": "Student", "email": "s@test.com", "password": "123", "batchId": "b1"}` |
| `POST` | `/mentors` | **Admin** | Create a Mentor account | `{"name": "Mentor", "email": "m@test.com", "password": "123"}` |

---

## 3. Admin Resources

**Prefix:** `/api/admin`
*Requires `role: admin`*

### User Ops
*   `GET /students` - List all students
*   `GET /mentors` - List all mentors
*   `GET /getUsersByRole/:role` - Get users by role
*   `PUT /update-status/:id` - Update status `{ "status": "active" }`
*   `PUT /activate/:id` - Activate user
*   `PUT /deactivate/:id` - Deactivate user
*   `DELETE /delete/:id` - Delete user

### Resource Oversight
Admin has access to almost all mentor/student resources under the `/admin` prefix.
*   `GET /assignments`, `POST /assignments`
*   `GET /sessions/mentorship`
*   `GET /skills`

---

## 4. Mentor Resources

**Prefix:** `/api/mentor`
*Requires `role: mentor`*

### Assignments
| Method | Endpoint | Description | Body / Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/assignments` | Create Assignment | `{"title": "JS Basics", "skillId": "...", "dueDate": "2024-12-31", "maxScore": 100}` |
| `GET` | `/assignments` | List Assignments | - |
| `PATCH` | `/assignments/grade/:studentAssignmentId` | Grade Submission | `{"score": 85}` |

### Attendance
| Method | Endpoint | Description | Body / Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/attendance/session/:sessionId` | View Session Attendance | - |
| `PATCH` | `/attendance/approve/:attendanceId` | Approve/Reject | `{"approved": true, "finalStatus": "present"}` |

### Sessions
| Method | Endpoint | Description | Body / Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/sessions/mentorship` | Schedule Session | `{"batchId": "...", "date": "...", "topic": "..."}` |

### Skills & Topics
| Method | Endpoint | Description | Body / Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/skills/topics` | Add Topic to Skill | `{"skillId": "...", "title": "Hooks", "difficulty": "easy", "estimatedMinutes": 30}` |
| `GET` | `/skills/topics/:skillId` | Get Topics | - |

---

## 5. Student Resources

**Prefix:** `/api`
*Requires `role: student` (mostly)*

### Dashboard
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/student` | **Student** | Get skills, recent assignments, stats |
| `GET` | `/dashboard/leaderboard` | **Any** | View top students |
| `PUT` | `/students/me/socials` | **Student** | Update profile links |

### Assignments
| Method | Endpoint | Role | Body / Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/assignments` | Auth | List all assignments |
| `GET` | `/assignments/my` | **Student** | List specific student's submissions |
| `POST` | `/assignments/submit` | **Student** | `{"assignmentId": "...", "timeTakenMinutes": 60}` |

### Learning & Attendance
| Method | Endpoint | Role | Body / Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/attendance/mark` | **Student** | `{"sessionId": "..."}` |
| `POST` | `/sessions/learning` | **Student** | Log self-study. `{"minutesSpent": 120, "tasksCompleted": 5, "codeSubmissions": 2}` |

### External Activity (Branding)
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/external-activities/post` | **Student** | Upload Link. `{"platform": "linkedin", "url": "..."}` |
| `GET` | `/external-activities/posts/my` | **Student** | View uploaded links |

### Skills
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/skills/progress` | **Student** | Update skill progress. `{"skillId": "...", "completedTopicId": "..."}` |
| `GET` | `/skills/progress/my` | **Student** | View my progress |

---

## 6. Dashboards
**Prefix:** `/api/dashboard`
*   `GET /student` - Student view
*   `GET /mentor` - Mentor/Admin view (At-risk students, stats)
*   `GET /leaderboard` - Public leaderboard

---

## 7. Step-by-Step Testing Scenario (Postman Guide)

Follow this order to test the full flow of the application.

### Phase 1: Setup Users
1.  **Register Admin**
    *   **Method**: `POST`
    *   **URL**: `{{url}}/admin`
    *   **Body**: `{"name": "Admin", "email": "admin@test.com", "password": "123"}`
2.  **Login as Admin**
    *   **Method**: `POST`
    *   **URL**: `{{url}}/login`
    *   **Body**: `{"email": "admin@test.com", "password": "123"}`
3.  **Create Mentor**
    *   **Method**: `POST`
    *   **URL**: `{{url}}/mentors`
    *   **Body**: `{"name": "Mr. Mentor", "email": "mentor@test.com", "password": "123"}`
4.  **Create Student**
    *   **Method**: `POST`
    *   **URL**: `{{url}}/students`
    *   **Body**: `{"name": "John Doe", "email": "student@test.com", "password": "123", "batchId": "B1"}`

### Phase 2: Mentor Actions (Switch to Mentor)
1.  **Login as Mentor**
    *   **Method**: `POST`
    *   **URL**: `{{url}}/login`
    *   **Body**: `{"email": "mentor@test.com", "password": "123"}`
2.  **Create Assignment**
    *   **Method**: `POST`
    *   **URL**: `{{url}}/mentor/assignments`
    *   **Body**: `{"title": "React Hooks", "skillId": "65123...", "dueDate": "2025-12-31", "maxScore": 100}`
    *   *Note: You might need to create a Skill first or use a dummy ObjectId if strict checks aren't enabled for the ID format, but preferably create a skill via DB or if an endpoint exists.*

### Phase 3: Student Actions (Switch to Student)
1.  **Login as Student**
    *   **Method**: `POST`
    *   **URL**: `{{url}}/login`
    *   **Body**: `{"email": "student@test.com", "password": "123"}`
2.  **View Assignments**
    *   **Method**: `GET`
    *   **URL**: `{{url}}/assignments`
    *   *Copy the `_id` of the assignment created by the mentor.*
3.  **Submit Assignment**
    *   **Method**: `POST`
    *   **URL**: `{{url}}/assignments/submit`
    *   **Body**: `{"assignmentId": "PASTE_ASSIGNMENT_ID_HERE", "timeTakenMinutes": 45}`
4.  **Log Learning Session**
    *   **Method**: `POST`
    *   **URL**: `{{url}}/sessions/learning`
    *   **Body**: `{"minutesSpent": 60, "tasksCompleted": 3, "codeSubmissions": 5}`

### Phase 4: Grading & Review (Switch to Mentor)
1.  **Login as Mentor**
    *   **Method**: `POST`
    *   **URL**: `{{url}}/login`
    *   **Body**: `{"email": "mentor@test.com", "password": "123"}`
2.  **View Student Dashboard (Admin/Mentor)**
    *   **Method**: `GET`
    *   **URL**: `{{url}}/mentor/skills/progress/STUDENT_USER_ID`
3.  **Grade Assignment**
    *   **Method**: `PATCH`
    *   **URL**: `{{url}}/mentor/assignments/grade/STUDENT_ASSIGNMENT_ID`
    *   *Note: Pass the ID of the `StudentAssignment` document (found in response to Submit or Get Assignments), not the original Assignment ID.*
    *   **Body**: `{"score": 95}`