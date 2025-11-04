# ⚠️ IMPORTANT: Restore queries.ts File

The `lib/supabase/queries.ts` file was accidentally overwritten and needs to be restored with all its original functions.

## Required Functions (in order):

1. **Imports and Setup**
```typescript
import { createClient } from './client'
import type { Database } from './database.types'

type User = Database['public']['Tables']['users']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
// ... other types

const supabase = createClient()
```

2. **User Queries**
- `getUserByEmail(email: string)`
- `getUserById(id: string)`
- `getAllUsers()`
- `createUser(userData)`
- `updateUser(id, updates)`
- `deleteUser(id)`

3. **Task Queries**
- `getTasks(filters?)`
- `createTask(taskData)`
- `updateTask(id, updates)`
- `deleteTask(id)`
- `subscribeToTasks(callback)`

4. **Work Submission Queries**
- `getWorkSubmissions(employeeId?, department?)`
- `getWorkSubmissionsForReview(departmentHeadId)`
- `reviewWorkSubmission(submissionId, reviewerId, action, notes?, rating?)`

5. **Purchase Request Queries**
- `getPurchaseRequests(filters?)`
- `getPurchaseRequestById(id)`
- `createPurchaseRequest(requestData)`
- `submitPurchaseRequest(id)`
- `reviewPurchaseRequest(id, reviewerId, action, notes?)`
- `getPurchaseWorkflowLog(purchaseRequestId)`

6. **Department Queries**
- `getDepartmentById(id)`
- `getDepartmentByName(name, branchId?)`
- `getAllDepartments()`

7. **Branch Queries**
- `getBranches()`
- `getBranchStats(branchId)`

8. **Leave Request Queries**
- `getLeaveRequests(userId)`
- `createLeaveRequest(requestData)`
- etc.

9. **NEW Functions Added**
- `getWorkSubmissions(userId: string)` - Get work submissions for a user
- `getTeamMembers(userId: string)` - Get team members for managers/department heads

## How to Restore

1. Check git history if available
2. Or rebuild from the codebase by looking at all imports
3. Add the new functions (`getWorkSubmissions` and `getTeamMembers`) to the restored file

## Current State

Currently the file only has:
- `getWorkSubmissions(userId: string)`
- `getTeamMembers(userId: string)`

All other functions are missing and need to be restored!

