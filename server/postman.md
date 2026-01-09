# Student Tracker API Documentation

Import the following details into Postman to test the API.
Base URL: `http://localhost:5000/api`

## Authentication (`/api`)

### Register Admin
- **Method:** `POST`
- **URL:** `{{base_url}}/admin`
- **Body (JSON):**
    ```json
    {
        "name": "Admin Name",
        "email": "admin@example.com",
        "password": "securepassword"
    }
    ```

### Register Student (Admin Only)
- **Method:** `POST`
- **URL:** `{{base_url}}/students`
- **Headers:** `Authorization: Bearer {{token}}`
- **Body (JSON):**
    ```json
    {
        "name": "Student Name",
        "email": "student@example.com",
        "password": "securepassword",
        "batchId": "optional_batch_id"
    }
    ```

### Register Mentor (Admin Only)
- **Method:** `POST`
- **URL:** `{{base_url}}/mentors`
- **Headers:** `Authorization: Bearer {{token}}`
- **Body (JSON):**
    ```json
    {
        "name": "Mentor Name",
        "email": "mentor@example.com",
        "password": "securepassword"
    }
    ```

### Login
- **Method:** `POST`
- **URL:** `{{base_url}}/login`
- **Body (JSON):**
    ```json
    {
        "email": "student@example.com",
        "password": "securepassword"
    }
    ```

### Logout
- **Method:** `POST`
- **URL:** `{{base_url}}/logout`

---

## Admin Routes (`/api/admin`)
**Headers:** `Authorization: Bearer {{admin_token}}`

### User Management
- **Get All Students:** `GET /admin/students`
- **Get All Mentors:** `GET /admin/mentors`
- **Get Student By ID:** `GET /admin/students/:id`
- **Get Mentor By ID:** `GET /admin/mentors/:id`
- **Update User Status:** `PUT /admin/update-status/:id`
- **Get Users By Role:** `GET /admin/getUsersByRole/:role`
- **Activate User:** `PUT /admin/activate/:id`
- **Deactivate User:** `PUT /admin/deactivate/:id`
- **Delete User:** `DELETE /admin/delete/:id`

### Assignments
- **Create Assignment:** `POST /admin/assignments`
    ```json
    {
        "title": "Assignment Title",
        "skillId": "skill_id",
        "dueDate": "2023-12-31",
        "maxScore": 100
    }
    ```
- **Get All Assignments:** `GET /admin/assignments`
- **Get Assignment By ID:** `GET /admin/assignments/:id`
- **Update Assignment:** `PATCH /admin/assignments/:id`
    ```json
    {
        "title": "Updated Title"
    }
    ```
- **Delete Assignment:** `DELETE /admin/assignments/:id`
- **Grade Assignment:** `PATCH /admin/assignments/grade/:studentAssignmentId`
    ```json
    {
        "score": 85
    }
    ```

### Attendance
- **Get Session Attendance:** `GET /admin/attendance/session/:sessionId`
- **Approve Attendance:** `PATCH /admin/attendance/approve/:attendanceId`
    ```json
    {
        "approved": true,
        "finalStatus": "present"
    }
    ```

### Sessions
- **Create Mentorship Session:** `POST /admin/sessions/mentorship`
    ```json
    {
        "batchId": "batch_id",
        "date": "2023-10-27T10:00:00Z",
        "topic": "Session Topic"
    }
    ```
- **Get Mentorship Sessions:** `GET /admin/sessions/mentorship`
- **Update Mentorship Session:** `PATCH /admin/sessions/mentorship/:id`
    ```json
    {
        "topic": "Updated Topic"
    }
    ```
- **Get Student Learning Sessions:** `GET /admin/sessions/learning/:userId`

### Notifications
- **Create Notification:** `POST /admin/notifications`
    ```json
    {
        "userId": "user_id",
        "type": "info",
        "message": "Notification message"
    }
    ```

### External Activities
- **Get User Activities:** `GET /admin/external-activities/:userId`

### Skills
- **Get All Skills:** `GET /admin/skills`
- **Create Skill Topic:** `POST /admin/skills/topics`
    ```json
    {
        "skillId": "skill_id",
        "title": "Topic Title",
        "difficulty": "medium",
        "estimatedMinutes": 60
    }
    ```
- **Get Skill Topics:** `GET /admin/skills/topics/:skillId`
- **Update Skill Topic:** `PATCH /admin/skills/topics/:id`
- **Delete Skill Topic:** `DELETE /admin/skills/topics/:id`
- **Get Student Skill Progress:** `GET /admin/skills/progress/:userId`

---

## Mentor Routes (`/api/mentor`)
**Headers:** `Authorization: Bearer {{mentor_token}}`

### Assignments
- **Create Assignment:** `POST /mentor/assignments` (Same body as Admin)
- **Get All Assignments:** `GET /mentor/assignments`
- **Get Assignment By ID:** `GET /mentor/assignments/:id`
- **Update Assignment:** `PATCH /mentor/assignments/:id`
- **Delete Assignment:** `DELETE /mentor/assignments/:id`
- **Grade Assignment:** `PATCH /mentor/assignments/grade/:studentAssignmentId` (Same body as Admin)

### Attendance
- **Get Session Attendance:** `GET /mentor/attendance/session/:sessionId`
- **Approve Attendance:** `PATCH /mentor/attendance/approve/:attendanceId` (Same body as Admin)

### Sessions
- **Create Mentorship Session:** `POST /mentor/sessions/mentorship` (Same body as Admin)
- **Get Mentorship Sessions:** `GET /mentor/sessions/mentorship`
- **Update Mentorship Session:** `PATCH /mentor/sessions/mentorship/:id`
- **Get Student Learning Sessions:** `GET /mentor/sessions/learning/:userId`

### Notifications
- **Create Notification:** `POST /mentor/notifications` (Same body as Admin)

### Skills
- **Get All Skills:** `GET /mentor/skills`
- **Create Skill Topic:** `POST /mentor/skills/topics` (Same body as Admin)
- **Get Skill Topics:** `GET /mentor/skills/topics/:skillId`
- **Update Skill Topic:** `PATCH /mentor/skills/topics/:id`
- **Delete Skill Topic:** `DELETE /mentor/skills/topics/:id`
- **Get Student Skill Progress:** `GET /mentor/skills/progress/:userId`

---

## Student Routes (`/api`)
**Headers:** `Authorization: Bearer {{student_token}}`

### Profile
- **Add Social Media Links:** `PUT /students/me/socials`
    ```json
    {
        "githubUrl": "https://github.com/user",
        "linkedinUrl": "https://linkedin.com/in/user",
        "mediumUrl": "https://medium.com/@user"
    }
    ```

### Assignments
- **Get All Assignments:** `GET /assignments`
- **Get My Assignments:** `GET /assignments/my`
- **Get Assignment By ID:** `GET /assignments/:id`
- **Submit Assignment:** `POST /assignments/submit`
    ```json
    {
        "assignmentId": "assignment_id",
        "timeTakenMinutes": 120
    }
    ```

### Attendance
- **Mark Attendance:** `POST /attendance/mark`
    ```json
    {
        "sessionId": "session_id"
    }
    ```
- **Get My Attendance:** `GET /attendance/my`

### Sessions
- **Get Mentorship Sessions:** `GET /sessions/mentorship`
- **Log Learning Session:** `POST /sessions/learning`
    ```json
    {
        "date": "2023-10-27T12:00:00Z",
        "minutesSpent": 90,
        "tasksCompleted": ["Task 1", "Task 2"],
        "codeSubmissions": ["link1"]
    }
    ```
- **Get My Learning Sessions:** `GET /sessions/learning/my`

### Notifications
- **Get My Notifications:** `GET /notifications`
- **Mark As Read:** `PATCH /notifications/:id/read`

### External Activities
- **Log External Activity:** `POST /external-activities`
    ```json
    {
        "platform": "leetcode",
        "metrics": {"solved": 10},
        "lastActivityDate": "2023-10-27"
    }
    ```
- **Get My Activities:** `GET /external-activities/my`
- **Add Branding Post:** `POST /external-activities/post`
    ```json
    {
        "platform": "linkedin",
        "url": "https://linkedin.com/posts/..."
    }
    ```
- **Get My Posts:** `GET /external-activities/posts/my`

### Skills
- **Get All Skills:** `GET /skills`
- **Get Skill Topics:** `GET /skills/topics/:skillId`
- **Update Skill Progress:** `POST /skills/progress`
    ```json
    {
        "skillId": "skill_id",
        "completedTopicId": "topic_id",
        "currentLevel": "intermediate"
    }
    ```
- **Get My Skill Progress:** `GET /skills/progress/my`

---

## Dashboard Routes (`/api/dashboard`)
**Headers:** `Authorization: Bearer {{token}}`

- **Get Student Dashboard:** `GET /dashboard/student` (Student)
- **Get Mentor Dashboard:** `GET /dashboard/mentor` (Mentor/Admin)
- **Get Leaderboard:** `GET /dashboard/leaderboard`
