# Leave Management System - Setup Guide

## Overview
A complete leave management system has been added to SGOAP, allowing employees to:
- View their leave balance by type
- Apply for leave
- Track used and remaining leave days
- See pending approvals
- Managers can approve/reject leave requests

## Database Setup

### Step 1: Run Organizational Features Migration
```sql
-- In Supabase SQL Editor, run:
supabase-organizational-features.sql
```

This creates:
- `leave_types` table
- `leave_balances` table
- `leave_requests` table
- `leave_calendar` table
- RLS policies
- Helper functions for balance calculation

### Step 2: Run Seed Data
```sql
-- Run seed data for initial setup:
supabase-organizational-seed.sql
```

This creates:
- 7 default leave types (Annual, Sick, Personal, Maternity, etc.)
- Initializes leave balances for all existing users
- Sample data for testing

### Step 3: Initialize Leave Balances for New Users
When a new user is created, run:
```sql
SELECT initialize_leave_balance('user-uuid-here');
```

Or this will be done automatically via triggers in future updates.

## Features Implemented

### 1. Employee Leave Page (`/leave`)
**Access:** All users

**Features:**
- ✅ View leave balance breakdown by type
- ✅ See used, pending, and remaining days
- ✅ Submit new leave requests
- ✅ View all leave requests with status
- ✅ Filter by status (All, Pending, Approved, Rejected)
- ✅ Real-time updates

**Leave Balance Display:**
- Total Allotted (including carried forward)
- Used days
- Pending days (awaiting approval)
- Remaining days
- Visual progress bars

### 2. Manager Approval Page (`/leave/approvals`)
**Access:** Managers, Department Heads, Executives, CEO, Admin

**Features:**
- ✅ View all pending leave requests
- ✅ See team member requests
- ✅ Approve leave requests
- ✅ Reject with reason
- ✅ View request history
- ✅ Real-time updates

**Approval Flow:**
1. Manager sees pending requests
2. Reviews employee details, dates, and reason
3. Clicks "Approve" or "Reject"
4. If rejecting, must provide reason
5. Balance automatically updates on approval

## Leave Types Included

1. **Annual Leave** - 20 days/year, can carry forward
2. **Sick Leave** - 10 days/year, no approval needed
3. **Personal Leave** - 5 days/year
4. **Maternity Leave** - 90 days/year
5. **Bereavement Leave** - 5 days/year
6. **Study Leave** - 10 days/year
7. **Unpaid Leave** - Unlimited, requires approval

You can customize these in the `leave_types` table.

## Automatic Balance Management

The system automatically:
- ✅ Deducts from "pending" when request is created
- ✅ Moves from "pending" to "used" when approved
- ✅ Refunds "pending" if request is rejected or cancelled
- ✅ Calculates "remaining" balance
- ✅ Tracks carry forward from previous year

## Usage Examples

### Employee Requesting Leave

1. Go to `/leave`
2. Click "Request Leave"
3. Select leave type
4. Choose start and end dates
5. Enter reason
6. Submit
7. Request shows as "Pending"
8. Balance shows updated "Pending" days

### Manager Approving Leave

1. Go to `/leave/approvals`
2. See list of pending requests
3. Review employee, dates, and reason
4. Click "Approve" or "Reject"
5. If rejecting, enter reason
6. Balance automatically updates

### Viewing Balance

Employees can see:
- Breakdown by leave type
- Total allotted per type
- Used days per type
- Pending requests per type
- Remaining days per type
- Visual progress indicators

## Database Functions

### Initialize Leave Balance
```sql
-- For a specific user and year
SELECT initialize_leave_balance('user-uuid', 2024);
```

### Manual Balance Adjustment
```sql
-- Update balance manually if needed
UPDATE leave_balances
SET total_allotted = 25,
    remaining = 25 - used - pending
WHERE user_id = 'user-uuid'
  AND leave_type_id = 'leave-type-001'
  AND year = 2024;
```

## Real-time Features

- Leave requests update in real-time
- Balance changes reflect immediately
- Managers see new requests as they're submitted
- No page refresh needed

## Navigation

Leave management is accessible via:
- Navigation menu: "Leave" link (visible to all)
- Direct URL: `/leave`
- Manager approvals: `/leave/approvals`

## Customization

### Adding Custom Leave Types
```sql
INSERT INTO leave_types (name, description, max_days_per_year, carry_forward, requires_approval, color)
VALUES ('Compensatory Leave', 'Time off for overtime work', 10, false, true, '#10b981');
```

### Changing Leave Policies
Update the `leave_types` table:
- `max_days_per_year` - Set to 0 for unlimited
- `carry_forward` - Allow/deny carrying unused days
- `requires_approval` - Auto-approve certain types

### Adjusting Leave Balances
```sql
-- Give employee more annual leave
UPDATE leave_balances
SET total_allotted = 30,
    remaining = 30 - used - pending
WHERE user_id = 'user-uuid'
  AND leave_type_id = 'leave-type-001'
  AND year = 2024;
```

## Integration Points

The leave system integrates with:
- **Notifications:** Send notifications on approval/rejection (implement as needed)
- **Calendar:** Leave calendar for team visibility (implement as needed)
- **Reports:** Analytics on leave usage (implement as needed)
- **Workflows:** Auto-approval rules (implement as needed)

## Troubleshooting

### Balance Not Showing
- Check if user has initialized balance: `SELECT * FROM leave_balances WHERE user_id = 'xxx'`
- Run `initialize_leave_balance()` function
- Verify user exists in `users` table

### Requests Not Appearing
- Check RLS policies allow viewing
- Verify manager's role has approval permissions
- Check if requests are filtered by status

### Balance Not Updating
- Check database triggers are enabled
- Verify `calculate_leave_balance()` function exists
- Check `update_leave_balance_on_approval()` trigger

## Next Steps

1. ✅ Leave management system - COMPLETE
2. Add leave calendar view
3. Add email notifications
4. Add leave reports/analytics
5. Add bulk approval
6. Add leave history export
7. Add leave policy templates

## API Functions

All functions in `lib/supabase/queries.ts`:

**For Employees:**
- `getLeaveTypes()` - Get available leave types
- `getLeaveBalance(userId, year?)` - Get balance
- `getLeaveRequests(userId)` - Get my requests
- `createLeaveRequest(requestData)` - Submit request

**For Managers:**
- `getLeaveRequests()` - Get all team requests
- `approveLeaveRequest(requestId, approverId)` - Approve
- `rejectLeaveRequest(requestId, approverId, reason)` - Reject

**Real-time:**
- `subscribeToLeaveRequests(userId, callback)` - Real-time updates

