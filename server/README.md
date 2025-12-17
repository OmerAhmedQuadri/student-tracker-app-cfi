# Student Tracker App (Backend)

This backend provides APIs for:
- Skill roadmap (topics covered vs pending, stage + progress)
- Weakness detection (low activity, broken streak, overdue assignments, weak skills)
- Daily/weekly learning activity tracking
- Branding/external activity tracking (GitHub + Medium sync; LinkedIn link stored only)
- Attendance/session tracking (student marks pending → mentor/admin approves)
- Assignments (mentor creates → student submits → mentor reviews)
- Leaderboard + notifications/reminders
- Mentor/Admin dashboard (batch overview)

## Run (Local)

1) Install deps

`cd server && pnpm install`

2) Configure env

Copy [server/.env.example](./.env.example) to `server/.env` and set values.

3) Start dev server

`cd server && pnpm dev`

## Postman Testing Guide

### Base URL

Assuming `PORT=5000`:

`http://localhost:5000/api`

### Common Headers

For JSON requests:

- `Content-Type: application/json`

Auth (cookie-based):

- After `POST /auth/register` or `POST /auth/login`, the server sets an HTTP-only cookie named `token`.
- Postman will store this cookie automatically (via `Set-Cookie`) and send it on the next requests.

### How to get the token

1) Call `POST /auth/register` or `POST /auth/login`
2) Verify `Set-Cookie: token=...` exists in the response
3) Call any protected route; Postman will send the cookie automatically

Note:
- The API also accepts `Authorization: Bearer <TOKEN>` as a fallback.

### Error response format

Most errors return:

```json
{ "message": "..." }
```

## API Documentation

All routes below are prefixed with `/api`.

---

## 1) Auth

### Register

`POST /auth/register`

Body:
```json
{
    "name": "Omar",
    "email": "omar@example.com",
    "password": "123456",
    "role": "student"
}
```

Expected 201 response:
```json
{
    "_id": "64f...",
    "name": "Omar",
    "email": "omar@example.com",
    "role": "student",
    "token": "eyJ..."
}
```

Notes:
- `role` is optional (defaults to `student`).

### Login

`POST /auth/login`

Body:
```json
{
    "email": "omar@example.com",
    "password": "123456"
}
```

Expected 200 response:
```json
{
    "_id": "64f...",
    "name": "Omar",
    "email": "omar@example.com",
    "role": "student",
    "token": "eyJ..."
}
```

---

## 2) Users (Admin)

### List users

`GET /users`

Auth: Admin only

Expected 200 response (array):
```json
[
    {
        "_id": "...",
        "name": "Omar",
        "email": "omar@example.com",
        "role": "student"
    }
]
```

### Create user

`POST /users`

Auth: Admin only

Body:
```json
{
    "name": "Student 1",
    "email": "student1@example.com",
    "password": "123456",
    "role": "student"
}
```

Expected 201 response:
```json
{ "_id": "...", "name": "Student 1", "email": "student1@example.com", "role": "student" }
```

### Get user by id

`GET /users/:id`

Auth: Any logged-in user

Expected 200 response:
```json
{
    "_id": "...",
    "name": "Student 1",
    "email": "student1@example.com",
    "role": "student",
    "totalPoints": 0,
    "streak": { "current": 0, "max": 0, "lastActivityDate": "2025-12-17T..." }
}
```

### Update user

`PUT /users/:id`

Auth: Any logged-in user

Body (any subset):
```json
{
    "name": "Student 1 Updated",
    "githubHandle": "octocat",
    "linkedinUrl": "https://www.linkedin.com/in/someone/",
    "mediumUrl": "https://medium.com/@mediumUser"
}
```

Expected 200 response: updated user object.

### Delete user

`DELETE /users/:id`

Auth: Admin only

Expected 200 response:
```json
{ "message": "User removed" }
```

---

## 3) Skills / Roadmap

### List skills

`GET /skills`

Auth: Any logged-in user

Expected 200 response (array):
```json
[
    {
        "_id": "...",
        "name": "JavaScript",
        "category": "Language",
        "topics": [
            { "title": "Variables", "description": "...", "resources": ["https://..."] }
        ]
    }
]
```

### Create skill

`POST /skills`

Auth: Admin only

Body:
```json
{
    "name": "JavaScript",
    "category": "Language",
    "topics": [
        { "title": "Variables", "description": "Basics", "resources": ["https://developer.mozilla.org/"] },
        { "title": "Functions" }
    ]
}
```

Expected 201 response: created skill.

### Get roadmap for a skill (topics covered vs pending)

`GET /skills/:id`

Auth: Any logged-in user (used mainly by students)

Expected 200 response:
```json
{
    "skillId": "...",
    "skillName": "JavaScript",
    "category": "Language",
    "progress": 50,
    "stage": "intermediate",
    "topics": [
        { "title": "Variables", "completed": true },
        { "title": "Functions", "completed": false }
    ],
    "covered": 1,
    "pending": 1
}
```

### Mark a topic completed

`POST /skills/:id/topics/complete`

Auth: Any logged-in user

Body (option A: by title):
```json
{ "topicTitle": "Variables", "minutesSpent": 45 }
```

Body (option B: by index):
```json
{ "topicIndex": 0, "minutesSpent": 45 }
```

Expected 200 response:
```json
{
    "message": "Topic marked as completed",
    "skillId": "...",
    "topicTitle": "Variables",
    "progress": 50,
    "stage": "intermediate",
    "covered": 1,
    "total": 2
}
```

---

## 4) Activity Tracking (Daily/Weekly)

### Get my activities

`GET /activities`

Auth: Any logged-in user

Expected 200 response (array):
```json
[
    {
        "_id": "...",
        "date": "2025-12-17T...",
        "minutesLearned": 60,
        "tasksCompleted": 2,
        "codeSubmissions": 1,
        "type": "learning",
        "description": "Studied arrays"
    }
]
```

### Log activity

`POST /activities`

Auth: Any logged-in user

Body:
```json
{
    "minutesLearned": 60,
    "tasksCompleted": 2,
    "codeSubmissions": 1,
    "type": "learning",
    "description": "Studied arrays"
}
```

Expected 201 response: created activity object.

Side effects:
- Updates streak
- Adds simple points (used by leaderboard)

---

## 5) Attendance (Student marks → Mentor approves)

### List attendance

`GET /attendance`

Auth:
- Student: returns own attendance
- Mentor/Admin: returns all, or filter by `?userId=<studentId>`

Expected 200 response (array):
```json
[
    {
        "_id": "...",
        "user": { "_id": "...", "name": "Omar", "email": "omar@example.com" },
        "date": "2025-12-17T00:00:00.000Z",
        "status": "pending",
        "notes": "I attended"
    }
]
```

### Student marks attendance (always creates `pending`)

`POST /attendance`

Auth: Student (or any logged-in user)

Body:
```json
{ "date": "2025-12-17", "notes": "I attended" }
```

Expected 201 response: created attendance record.

### Mentor/Admin approves attendance

`PUT /attendance/:id/approve`

Auth: Mentor or Admin

Body:
```json
{ "status": "present" }
```

Allowed statuses:
- `present`
- `absent`
- `cancelled`

Expected 200 response: updated attendance.

---

## 6) Assignments (Deadlines + Status)

### List assignments

`GET /assignments`

Auth:
- Student: own assignments
- Mentor/Admin: filter by `?studentId=<id>` (optional)

Expected 200 response (array):
```json
[
    {
        "_id": "...",
        "student": { "_id": "...", "name": "Omar", "email": "omar@example.com" },
        "title": "JS Arrays Practice",
        "status": "pending",
        "dueDate": "2025-12-20T00:00:00.000Z"
    }
]
```

### Mentor/Admin creates an assignment

`POST /assignments`

Auth: Mentor or Admin

Body:
```json
{
    "studentId": "<STUDENT_ID>",
    "title": "JS Arrays Practice",
    "skillId": "<SKILL_ID>",
    "dueDate": "2025-12-20"
}
```

Expected 201 response: created assignment.

### Student submits assignment

`PUT /assignments/:id/submit`

Auth: Student

Body:
```json
{ "timeSpentMinutes": 120, "notes": "Solved all tasks" }
```

Expected 200 response: updated assignment.

Status behavior:
- If submitted after `dueDate`, status becomes `late`
- Otherwise status becomes `submitted`

### Mentor/Admin reviews assignment

`PUT /assignments/:id/review`

Auth: Mentor or Admin

Body:
```json
{ "status": "approved", "score": 80, "notes": "Good work" }
```

Expected 200 response: updated assignment.

Side effects:
- On `approved` with a `score`, student gains points.

---

## 7) Branding / External Tracking

### Sync my branding stats into my user profile

`POST /integrations/sync`

Auth: Any logged-in user

Body: none

Expected 200 response:
```json
{
    "message": "Branding synced",
    "branding": {
        "github": { "commitsThisWeek": 3, "projectsPushed": 5, "lastActivityAt": "2025-12-16T..." },
        "medium": { "blogsPublished": 10, "lastBlogAt": "2025-10-01T..." }
    }
}
```

Notes:
- GitHub reads public events; results are simplified.
- Medium uses RSS feed and returns recent items count.
- LinkedIn syncing is not supported without OAuth (we only store the profile link).

Setup (store links/handles on your user profile via `PUT /users/:id`):
- `githubHandle`: `octocat`
- `mediumUrl`: `https://medium.com/@yourname` or `@yourname` or just `yourname`
- `linkedinUrl`: `https://www.linkedin.com/in/your-slug/`

### Preview GitHub stats

`GET /integrations/github/:username`

Expected 200 response:
```json
{
    "publicRepos": 10,
    "followers": 2,
    "lastActivity": "2025-12-16T...",
    "recentCommits": 3,
    "recentRepos": [
        { "name": "repo1", "url": "https://github.com/...", "updatedAt": "2025-12-10T..." }
    ]
}
```

### Preview Medium stats

`GET /integrations/medium/:username`

Expected 200 response:
```json
{ "blogsPublished": 10, "lastBlogDate": "2025-10-01T..." }
```

### Preview LinkedIn stats (placeholder)

`GET /integrations/linkedin/:profileId`

Expected 200 response:
```json
{ "supported": false, "message": "LinkedIn stats sync is not supported (no OAuth, no scraping). Store your LinkedIn profile link on your user profile instead." }
```

---

## 8) Notifications

### List my notifications

`GET /notifications`

Auth: Any logged-in user

Expected 200 response (array):
```json
[
    {
        "_id": "...",
        "message": "You missed 2 assignments.",
        "type": "info",
        "isRead": false,
        "createdAt": "2025-12-17T..."
    }
]
```

### Mark a notification as read

`PUT /notifications/:id/read`

Auth: Any logged-in user

Body: none

Expected 200 response: updated notification.

---

## 9) Leaderboard

`GET /leaderboard`

Auth: Any logged-in user

Expected 200 response (array):
```json
[
    {
        "_id": "...",
        "name": "Omar",
        "totalPoints": 42,
        "leaderboardScore": 67,
        "streak": { "current": 5, "max": 10, "lastActivityDate": "2025-12-17T..." }
    }
]
```

---

## 10) Analytics

### My summary (weekly totals + streak + assignments)

`GET /analytics/me/summary`

Auth: Any logged-in user

Expected 200 response:
```json
{
    "weekly": { "weekStart": "2025-12-15T00:00:00.000Z", "now": "2025-12-17T...", "minutesLearned": 120, "tasksCompleted": 4, "codeSubmissions": 2 },
    "assignments": { "total": 5, "pending": 2, "overdue": 1, "avgScore": 75 },
    "streak": { "current": 5, "max": 10, "lastActivityDate": "2025-12-17T..." },
    "totalPoints": 42,
    "leaderboardScore": 67
}
```

### My weaknesses

`GET /analytics/me/weaknesses`

Auth: Any logged-in user

Expected 200 response:
```json
{
    "lowActivity": false,
    "brokenStreak": false,
    "overdueAssignments": 1,
    "weakSkills": [
        { "skillId": "...", "skillName": "JavaScript", "avgScore": 55, "avgTimeMinutes": 300 }
    ]
}
```

### Mentor/Admin dashboard

`GET /analytics/dashboard`

Auth: Mentor or Admin

Expected 200 response:
```json
{
    "totalStudents": 25,
    "fallingBehind": [
        { "_id": "...", "name": "Student 1", "email": "...", "streak": 0, "totalPoints": 5 }
    ],
    "commonWeakSkills": [
        { "skillId": "...", "skillName": "JavaScript", "avgScore": 50, "samples": 12 }
    ],
    "commonWeakTopics": [
        { "skillId": "...", "skillName": "JavaScript", "topicTitle": "Closures", "completionRate": 8 }
    ],
    "engagementMinutesLast7Days": [
        { "day": "2025-12-11T00:00:00.000Z", "minutes": 120 }
    ]
}
```

---

## Quick Postman Checklist

1) `POST /auth/register` → copy `token`
2) Set Bearer token in Postman
3) (Admin) `POST /skills` create a skill
4) (Student) `GET /skills/:id` view roadmap
5) (Student) `POST /skills/:id/topics/complete` complete a topic
6) (Mentor/Admin) `POST /assignments` create assignment → student submits → mentor reviews

