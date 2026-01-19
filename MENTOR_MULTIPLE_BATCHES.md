# Mentor Multiple Batches Feature

## Overview
This update allows mentors to be assigned to multiple batches simultaneously, while students continue to be assigned to a single batch.

## Database Schema Changes

### User Model Updates
- **New Field**: `batchIds` (array of strings) - For mentors to support multiple batch assignments
- **Existing Field**: `batchId` (string) - Continues to be used for students (single batch)

```typescript
export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: "student" | "mentor" | "admin";
  batchId?: string;      // For students - single batch
  batchIds?: string[];   // For mentors - multiple batches
  status: "pending" | "active" | "suspended";
  isActive: boolean;
}
```

## API Changes

### 1. Assign Batch to User (Updated)
**Endpoint**: `PATCH /api/admin/users/:userId/batch`

**Behavior**:
- **For Students**: Assigns a single batch using `batchId`
- **For Mentors**: 
  - Accepts either `batchId` (adds to array) or `batchIds` (replaces array)
  - Prevents duplicate batch assignments

**Request Body**:
```json
// For students or adding single batch to mentor
{
  "batchId": "A26"
}

// For setting multiple batches for mentor
{
  "batchIds": ["A26", "B27", "C28"]
}
```

### 2. Update Mentor Batches (New)
**Endpoint**: `PATCH /api/admin/mentors/:userId/batches`

**Description**: Add or remove individual batches from a mentor's assignment

**Request Body**:
```json
// Add a batch
{
  "action": "add",
  "batchId": "A26"
}

// Remove a batch
{
  "action": "remove",
  "batchId": "B27"
}
```

**Response**:
```json
{
  "_id": "mentor_id",
  "name": "John Mentor",
  "email": "mentor@example.com",
  "role": "mentor",
  "batchIds": ["A26", "C28"],
  "status": "active",
  "isActive": true
}
```

### 3. Get Mentor Students (Updated)
**Endpoint**: `GET /api/mentor/students`

**Changes**: 
- Now returns students from ALL batches assigned to the mentor
- Supports both old `batchId` and new `batchIds` for backward compatibility

### 4. Get Mentor Batches (Updated)
**Endpoint**: `GET /api/mentor/batches`

**Changes**:
- Returns combined list of batches from:
  - Mentor's `batchIds` array
  - Mentor's legacy `batchId` field
  - Historical batches from `MentorshipSession` records

**Response**:
```json
["A26", "B27", "C28"]
```

### 5. Get Batch Attendance History (Updated)
**Endpoint**: `GET /api/mentor/attendance/history`

**Changes**:
- Returns attendance for students across ALL of the mentor's assigned batches

### 6. Get All Batches (Updated)
**Endpoint**: `GET /api/admin/batches`

**Changes**:
- Groups data correctly when mentors are in multiple batches
- Each batch object shows all mentors assigned to it (even if mentor has multiple batches)

### 7. Get Batch by ID (Updated)
**Endpoint**: `GET /api/admin/batches/:batchId`

**Changes**:
- Queries both `batchId` and `batchIds` fields to find all mentors in the specified batch

## Backward Compatibility

The implementation maintains backward compatibility:

1. **Old mentor records**: If a mentor only has `batchId` set, it will be treated as a single-batch assignment
2. **Migration path**: Existing mentors with `batchId` can continue working without modification
3. **Graceful fallback**: All queries check both `batchId` and `batchIds` fields

## Migration Guide

### For Existing Data

No immediate migration is required. The system will work with existing data:

- Mentors with only `batchId` set will continue to work
- New batch assignments will use the `batchIds` array

### Optional Migration Script

To migrate existing mentor `batchId` values to `batchIds`:

```javascript
// Run in MongoDB shell or Node.js script
db.users.find({ role: "mentor", batchId: { $exists: true, $ne: null } }).forEach(mentor => {
  if (!mentor.batchIds || mentor.batchIds.length === 0) {
    db.users.updateOne(
      { _id: mentor._id },
      { 
        $set: { batchIds: [mentor.batchId] },
        $unset: { batchId: "" }
      }
    );
  }
});
```

## Frontend Integration

### Update TypeScript Interfaces

Update the User interface in frontend code:

```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  isActive: boolean;
  batchId?: string;      // For students
  batchIds?: string[];   // For mentors
  createdAt: string;
}
```

### Display Multiple Batches

When showing mentor information, display all assigned batches:

```typescript
const MentorBatches = ({ mentor }) => {
  const batches = mentor.batchIds || (mentor.batchId ? [mentor.batchId] : []);
  
  return (
    <div>
      {batches.length > 0 ? (
        <div className="flex gap-2">
          {batches.map(batch => (
            <Badge key={batch}>{batch}</Badge>
          ))}
        </div>
      ) : (
        <span>No batches assigned</span>
      )}
    </div>
  );
};
```

### Batch Assignment UI

For admin panel, create UI to manage multiple batches:

```typescript
// Add batch to mentor
await api.patch(`/admin/mentors/${mentorId}/batches`, {
  action: 'add',
  batchId: selectedBatch
});

// Remove batch from mentor
await api.patch(`/admin/mentors/${mentorId}/batches`, {
  action: 'remove',
  batchId: batchToRemove
});

// Replace all batches
await api.patch(`/admin/users/${mentorId}/batch`, {
  batchIds: ['A26', 'B27', 'C28']
});
```

## Testing

### Test Cases

1. **Assign single batch to student**
   - Should update `batchId` field
   - Should not affect `batchIds`

2. **Assign single batch to mentor**
   - Should add to `batchIds` array
   - Should prevent duplicates

3. **Assign multiple batches to mentor**
   - Should replace `batchIds` array
   - Should work with array of batch IDs

4. **Add batch to mentor**
   - Should append to existing `batchIds`
   - Should not create duplicates

5. **Remove batch from mentor**
   - Should remove specific batch from `batchIds`
   - Should not affect other batches

6. **Get mentor students**
   - Should return students from all assigned batches
   - Should work with legacy `batchId`

7. **Get batch details**
   - Should show all mentors assigned to that batch
   - Should handle mentors in multiple batches

## Security Considerations

- Only admins can assign/modify batch assignments
- Mentors can only view students from their assigned batches
- Students can only be in one batch at a time

## Performance Notes

- Queries using `$in` operator for multiple batch lookups
- Consider indexing `batchIds` field if you have many mentors/batches
- Batch listing groups data efficiently using Map structure

## Future Enhancements

Potential improvements:

1. Batch capacity limits
2. Primary batch designation for mentors
3. Batch creation/deletion management
4. Batch transfer history tracking
5. Automated batch assignment based on capacity
