# Frontend Updates for Multiple Batches Support

## Overview
Updated frontend to support mentors having multiple batches while students remain with single batch assignment.

## Files Modified

### 1. `/client/src/components/pages/admin/Users.tsx`

#### Interface Updates
- Updated `User` interface to include `batchIds?: string[]` for mentors
- Updated state to track both single batch input (students) and multiple batches (mentors)

#### UI Changes
- **Batch Display Column**: Now shows:
  - For students: Single badge with their batch
  - For mentors: Multiple badges (one per batch) with purple styling
  - Fallback to legacy `batchId` if `batchIds` not present
  
- **Batch Assignment Modal**: Dynamic modal that shows:
  - For students: Single batch input field
  - For mentors: Comma-separated batch input with live preview badges
  - Current batch(es) displayed for reference
  - Role badge to indicate student vs mentor

#### Logic Updates
- `handleAssignBatch`: Sends `batchIds` array for mentors, `batchId` string for students
- `openBatchModal`: Initializes state with user's current batches based on role

### 2. `/client/src/components/pages/admin/AdminDashboard.tsx`

#### Interface Updates
- Updated `User` interface to include `batchIds?: string[]`
- Updated batch editing state to track role and multiple batches

#### UI Changes
- **Batch Table Column**: Displays multiple badges for mentors with purple styling
- **Batch Assignment Modal**: Same dynamic functionality as Users page
  - Role-aware input fields
  - Preview of selected batches
  - Current batch information display

#### Logic Updates
- `handleAssignBatch`: Role-aware API calls
- `openBatchModal`: Extracts batches from `batchIds` or `batchId`
- State management for both single and array inputs

### 3. `/client/src/components/pages/admin/BatchManagement.tsx`

#### Interface Updates
- Updated mentor interface to include `batchIds?: string[]`
- Ready to display mentors who are assigned to multiple batches

## Key Features

### 1. Role-Aware Batch Assignment
```typescript
// Students get single batch
if (userRole === 'student') {
  await api.patch(`/admin/users/${userId}/batch`, { batchId: 'A26' });
}

// Mentors get array of batches
if (userRole === 'mentor') {
  await api.patch(`/admin/users/${userId}/batch`, { 
    batchIds: ['A26', 'B27', 'C28'] 
  });
}
```

### 2. Visual Differentiation
- **Students**: Blue badges for their single batch
- **Mentors**: Purple badges for each of their batches
- Multiple badges displayed in a flex-wrap layout

### 3. Backward Compatibility
- Checks for `batchIds` first, falls back to `batchId`
- Handles legacy data seamlessly
- No breaking changes for existing data

### 4. User Experience
- Clear role indication in modal
- Live preview of batch assignments
- Current vs new batch comparison
- Comma-separated input for easy multiple batch entry

## Usage Examples

### Assigning Single Batch to Student
1. Click edit icon next to student
2. Modal shows "Assign Batch" title
3. Enter single batch ID (e.g., "A26")
4. Click Assign

### Assigning Multiple Batches to Mentor
1. Click edit icon next to mentor
2. Modal shows "Assign Batches" title (plural)
3. Enter comma-separated batches (e.g., "A26, B27, C28")
4. See live preview badges as you type
5. Click Assign

## API Integration

### Request Format
```typescript
// Student assignment
PATCH /api/admin/users/:userId/batch
Body: { batchId: "A26" }

// Mentor assignment (multiple)
PATCH /api/admin/users/:userId/batch
Body: { batchIds: ["A26", "B27", "C28"] }
```

### Response Format
```typescript
{
  _id: "user_id",
  name: "User Name",
  role: "mentor",
  batchIds: ["A26", "B27"],  // For mentors
  // OR
  batchId: "A26",            // For students
  ...
}
```

## Testing Checklist

- [x] Student batch assignment shows single input field
- [x] Mentor batch assignment shows comma-separated input
- [x] Students display single blue batch badge
- [x] Mentors display multiple purple batch badges
- [x] Modal title changes based on role (Batch vs Batches)
- [x] Current batches displayed correctly
- [x] Backend receives correct format (batchId vs batchIds)
- [x] Legacy batchId field still works for mentors
- [x] Empty batches handled gracefully ("No batch" / "No batches")

## Visual Reference

### Student Batch Display
```
┌─────────────────────────────────┐
│ Name: John Student              │
│ Batch: [A26] 🖊️                 │
│ Role: 🎓 Student                │
└─────────────────────────────────┘
```

### Mentor Batch Display
```
┌─────────────────────────────────┐
│ Name: Jane Mentor               │
│ Batches: [A26] [B27] [C28] 🖊️   │
│ Role: 🏫 Mentor                 │
└─────────────────────────────────┘
```

### Modal - Student
```
┌─────────────────────────────────┐
│ Assign Batch                    │
├─────────────────────────────────┤
│ User: John Student              │
│ [🎓 Student]                    │
│                                 │
│ Batch ID:                       │
│ [________________]              │
│ Current: A25                    │
│                                 │
│         [Cancel]  [Assign]      │
└─────────────────────────────────┘
```

### Modal - Mentor
```
┌─────────────────────────────────┐
│ Assign Batches                  │
├─────────────────────────────────┤
│ User: Jane Mentor               │
│ [🏫 Mentor]                     │
│                                 │
│ Batch IDs (comma-separated):    │
│ [A26, B27, C28_____________]    │
│ Preview: [A26] [B27] [C28]      │
│ Current: A26, B27               │
│                                 │
│         [Cancel]  [Assign]      │
└─────────────────────────────────┘
```

## Next Steps

1. Test with real data
2. Consider adding individual batch add/remove buttons for mentors
3. Add batch search/autocomplete for easier selection
4. Implement batch analytics per mentor
5. Add bulk batch assignment feature
