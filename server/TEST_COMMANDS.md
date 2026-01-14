# Quick Test Commands for Student Tracker App

## 1. Create Admin User
```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin"
  }'
```

## 2. Login as Admin
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

## 3. Create Mentor
```bash
curl -X POST http://localhost:5000/api/mentors \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "John Mentor",
    "email": "mentor@test.com",
    "password": "mentor123"
  }'
```

**Copy the `_id` from the response above and use it below!**

## 4. Assign Batch to Mentor (Replace USER_ID_HERE)
```bash
curl -X PATCH http://localhost:5000/api/admin/users/USER_ID_HERE/batch \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "batchId": "A26"
  }'
```

## 5. Create Students with Batch A26
```bash
# Student 1
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Alice Student",
    "email": "alice@test.com",
    "password": "student123",
    "batch": "A26"
  }'

# Student 2
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Bob Student",
    "email": "bob@test.com",
    "password": "student123",
    "batch": "A26"
  }'

# Student 3
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Charlie Student",
    "email": "charlie@test.com",
    "password": "student123",
    "batch": "A26"
  }'
```

## 6. Create Students with Different Batch (B27)
```bash
# Student 4
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "David Student",
    "email": "david@test.com",
    "password": "student123",
    "batch": "B27"
  }'

# Student 5
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Emma Student",
    "email": "emma@test.com",
    "password": "student123",
    "batch": "B27"
  }'
```

## 7. Login as Mentor
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -c mentor-cookies.txt \
  -d '{
    "email": "mentor@test.com",
    "password": "mentor123"
  }'
```

## 8. Create Mentorship Sessions (as Mentor)
```bash
# Session 1
curl -X POST http://localhost:5000/api/mentor/sessions/mentorship \
  -H "Content-Type: application/json" \
  -b mentor-cookies.txt \
  -d '{
    "batchId": "A26",
    "date": "2026-01-15T10:00:00Z",
    "topic": "React Fundamentals"
  }'

# Session 2
curl -X POST http://localhost:5000/api/mentor/sessions/mentorship \
  -H "Content-Type: application/json" \
  -b mentor-cookies.txt \
  -d '{
    "batchId": "A26",
    "date": "2026-01-20T14:00:00Z",
    "topic": "Node.js Backend Development"
  }'
```

## 9. Get Mentor's Students (should show only A26 batch)
```bash
curl -X GET http://localhost:5000/api/mentor/students \
  -H "Content-Type: application/json" \
  -b mentor-cookies.txt
```

## 10. Get Mentor's Sessions
```bash
curl -X GET http://localhost:5000/api/mentor/sessions/mentorship \
  -H "Content-Type: application/json" \
  -b mentor-cookies.txt
```

## 11. Create Skills (as Admin)
```bash
# JavaScript Skill
curl -X POST http://localhost:5000/api/admin/skills \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "JavaScript",
    "category": "technical",
    "order": 1
  }'

# React Skill
curl -X POST http://localhost:5000/api/admin/skills \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "React",
    "category": "technical",
    "order": 2
  }'

# Node.js Skill
curl -X POST http://localhost:5000/api/admin/skills \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Node.js",
    "category": "technical",
    "order": 3
  }'
```

## Testing Batch Assignment in UI

### Method 1: Using UI
1. Login as admin@test.com / admin123
2. Go to Admin → Manage Users
3. Click the edit icon next to the mentor's name
4. Enter "A26" in the batch field
5. Click Assign

### Method 2: Using curl (after creating mentor)
1. Get the mentor's user ID from the create response
2. Run the PATCH command in step 4 above with the actual ID

## Login Credentials Created

| Role    | Email              | Password    | Batch |
|---------|-------------------|-------------|-------|
| Admin   | admin@test.com    | admin123    | -     |
| Mentor  | mentor@test.com   | mentor123   | A26   |
| Student | alice@test.com    | student123  | A26   |
| Student | bob@test.com      | student123  | A26   |
| Student | charlie@test.com  | student123  | A26   |
| Student | david@test.com    | student123  | B27   |
| Student | emma@test.com     | student123  | B27   |

## Expected Behavior

- When logged in as mentor@test.com:
  - `/mentor/students` should return only Alice, Bob, Charlie (Batch A26)
  - `/mentor/attendance` should show these 3 students
  - `/mentor/attendance/history` should show attendance for these students only

- David and Emma (Batch B27) should NOT appear for this mentor
