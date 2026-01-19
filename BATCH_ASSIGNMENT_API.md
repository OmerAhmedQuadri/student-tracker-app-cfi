# Batch Assignment API Documentation

## Backend API

### Assign Batch to User (Mentor/Student)

**Endpoint:** `PATCH /api/admin/users/:userId/batch`

**Authentication:** Required (Admin only)

**Request:**
```json
{
  "batchId": "A26"
}
```

**Response:**
```json
{
  "_id": "user_id_here",
  "name": "John Mentor",
  "email": "mentor@test.com",
  "role": "mentor",
  "batchId": "A26",
  "isActive": true,
  "createdAt": "2026-01-10T..."
}
```

**Error Responses:**
- `404`: User not found
- `401`: Unauthorized (not admin)

---

## Frontend Implementation

### Location
File: `/client/src/pages/admin/Users.tsx`

### Features
1. **View Batch**: Shows current batch for each user in the table
2. **Edit Button**: Click the edit icon next to batch name
3. **Modal Dialog**: Opens when editing batch
4. **Assign/Update**: Updates batch for the selected user

### Code Example

```typescript
// Function to assign batch
const handleAssignBatch = async () => {
    if (!editingBatch) return;
    
    try {
        await api.patch(`/admin/users/${editingBatch.userId}/batch`, {
            batchId: batchInput
        });
        toast.success('Batch assigned successfully');
        setEditingBatch(null);
        setBatchInput('');
        fetchUsers();
    } catch (error) {
        console.error('Failed to assign batch:', error);
        toast.error('Failed to assign batch');
    }
};
```

### UI Flow
1. Admin goes to **Admin → Manage Users**
2. In the **Batch** column, click the edit icon (✏️)
3. Modal opens with input field
4. Enter batch name (e.g., "A26", "B27")
5. Click **Assign** button
6. Batch is updated for the user

---

## How It Works

### For Mentors
When a mentor is assigned a batch (e.g., "A26"):
- They will only see students with `batchId: "A26"`
- Endpoints affected:
  - `GET /api/mentor/students` - Returns only batch students
  - `GET /api/mentor/attendance/history` - Shows only batch attendance

### For Students
When a student is assigned a batch (e.g., "A26"):
- They are grouped with other students in the same batch
- They appear in their mentor's student list (if mentor has same batch)

### Fallback Behavior
If a mentor has **no batch assigned** (`batchId: null`):
- Backend returns **all students** (development mode)
- This allows testing without strict batch enforcement

---

## Usage Examples

### 1. Assign Batch via UI
```
1. Login as admin
2. Go to Admin → Manage Users
3. Find mentor "John Mentor"
4. Click edit icon in Batch column
5. Enter "A26"
6. Click Assign
```

### 2. Assign Batch via API
```bash
# Login as admin first
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'

# Assign batch to user
curl -X PATCH http://localhost:5000/api/admin/users/USER_ID_HERE/batch \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "batchId": "A26"
  }'
```

### 3. Create User with Batch (Students only)
```bash
# When creating a student, include batch in the request
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Alice Student",
    "email": "alice@test.com",
    "password": "student123",
    "batch": "A26"
  }'
```

**Note:** Mentors must be assigned batch **after** creation using the PATCH endpoint.

---

## Database Schema

### User Model
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'mentor' | 'admin';
  batchId?: string;  // Optional batch identifier
  isActive: boolean;
  createdAt: Date;
}
```

---

## Testing

### Test Batch Setup
1. Create admin account
2. Create mentor (no batch initially)
3. Assign batch "A26" to mentor via UI or API
4. Create 3 students with batch "A26"
5. Create 2 students with batch "B27"
6. Login as mentor → should see only "A26" students

### Expected Results
- Mentor sees: Alice, Bob, Charlie (batch A26)
- Mentor does NOT see: David, Emma (batch B27)

---

## Related Files

**Backend:**
- `/server/src/controller/admin.ts` - assignBatch function
- `/server/src/routes/admin.ts` - PATCH /users/:userId/batch route
- `/server/src/models/User.ts` - User model with batchId field
- `/server/src/controller/mentorStudents.ts` - Batch filtering logic

**Frontend:**
- `/client/src/pages/admin/Users.tsx` - Batch assignment UI
- `/client/src/pages/MentorAttendance.tsx` - Uses batch-filtered students
- `/client/src/pages/MentorStudents.tsx` - Shows batch students

---

## Status: ✅ Fully Implemented

All features are working and tested:
- ✅ Backend API endpoint
- ✅ Frontend UI with modal
- ✅ Batch filtering for mentors
- ✅ Toast notifications
- ✅ Error handling
