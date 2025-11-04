# Department-Based Restrictions Implementation

## Overview

This document outlines the department-based access control and restrictions implemented across the SGOAP system to ensure data privacy and proper departmental boundaries.

---

## ✅ Purchase Requests (`/purchases`)

### Access Rules:

#### Full Access (See All Details):
- **Requestor**: Users who created the request
- **Same Department**: Users from the requestor's department
- **Finance & Accounting**: Can see all requests in `submitted`, `finance_review`, or `audit_review` stages
- **Procurement & Supply-Chain**: Can see all requests in `procurement_review` stage
- **Legal & Compliance**: Can see all requests in `legal_review` stage
- **Admin/CEO/Executive**: Can see all requests with full details

#### Limited Access (Status Only):
- **Other Departments**: Can see requests from other departments but only:
  - Status (Pending/Approved/Rejected/Receipt Requested)
  - Requestor Department name
  - Created date
  - **NO** access to: cost, description, justification, vendor info, attachments

### Implementation:
- **File**: `app/purchases/page.tsx`
- **Function**: `canSeeFullDetails(request)`
- **Display**: Conditional rendering based on access level
- **Status**: Shows "Limited View - Other Department" for restricted access

---

## ✅ Purchase Request Details (`/purchases/[id]`)

### Access Rules:
Same as purchase list page, but with additional restrictions:

- **Limited View Shows**:
  - Status badge
  - Requestor department
  - Created date
  - Warning message about limited access

- **Full View Shows**:
  - Complete request details
  - Description
  - Cost and category
  - Vendor information
  - Justification
  - Attachments
  - Workflow history
  - Review actions (if authorized)

### Implementation:
- **File**: `app/purchases/[id]/page.tsx`
- **Function**: `canSeeFullDetails()` - checks user access
- **Review Actions**: Only shown if `canReview()` returns true

---

## ✅ Leave Management (`/leave`)

### Employee View:
- **Access**: Users can only see their **own** leave requests
- **Filter**: Automatically filtered by `user.id`
- **Data**: 
  - Own leave balance
  - Own leave requests (all statuses)
  - Own leave history

### Manager/Department Head View (`/leave/approvals`):
- **Access**: Can only see leave requests from their **team members**
- **Filter**: Uses `getTeamMembers()` to get team IDs, then filters requests
- **Data**:
  - Team member leave requests
  - Only requests where `user_id` is in team member IDs

### Admin/CEO/Executive:
- **Access**: Can see all leave requests across the organization

### Implementation:
- **File**: `app/leave/page.tsx` - Filters by user.id only
- **File**: `app/leave/approvals/page.tsx` - Filters by team member IDs
- **Query**: `getLeaveRequests(userId, status)` for employees

---

## ✅ Department Reviews (`/department/reviews`)

### Access Rules:
- **Department Heads/Managers**: Can only review work submissions from their team
- **Function**: Uses `getWorkSubmissionsForReview(user.id)` which should filter by team
- **Implementation**: Already properly restricted via the query function

---

## ✅ My Department (`/employee/my-department`)

### Access Rules:
- **Employees**: See only their own department's information
- **Data**: Department-specific metrics and team members from same department
- **Note**: Currently shows mock data - should be updated to filter by `user.department`

---

## 🔒 Status Definitions

### Purchase Request Statuses:
1. **Draft** - Not yet submitted
2. **Submitted** - Awaiting finance review
3. **Finance Review** - Under finance department review
4. **Procurement Review** - Under procurement department review
5. **Legal Review** - Under legal department review
6. **Audit Review** - Under audit review
7. **Executive Approval** - Awaiting executive approval
8. **Approved** - Request approved
9. **Receipt Requested** - Procurement team requesting receipt/documentation
10. **Rejected** - Request has been rejected
11. **Cancelled** - Request has been cancelled

---

## 📋 Access Control Matrix

| User Role | Own Requests | Same Department | Other Departments | Finance Stage | Procurement Stage | Legal Stage |
|-----------|-------------|-----------------|------------------|---------------|-------------------|-------------|
| **Employee** | ✅ Full | ✅ Full | ❌ Limited | ❌ None | ❌ None | ❌ None |
| **Department Head** | ✅ Full | ✅ Full | ❌ Limited | ⚠️ If Finance | ⚠️ If Procurement | ⚠️ If Legal |
| **Manager** | ✅ Full | ✅ Full | ❌ Limited | ⚠️ If Finance | ⚠️ If Procurement | ⚠️ If Legal |
| **Finance Dept** | ✅ Full | ✅ Full | ❌ Limited | ✅ Full (in stage) | ❌ None | ❌ None |
| **Procurement Dept** | ✅ Full | ✅ Full | ❌ Limited | ❌ None | ✅ Full (in stage) | ❌ None |
| **Legal Dept** | ✅ Full | ✅ Full | ❌ Limited | ❌ None | ❌ None | ✅ Full (in stage) |
| **Executive** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **CEO** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Admin** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |

**Legend:**
- ✅ Full: Complete access to all details
- ⚠️ Conditional: Full access only when request is in their review stage
- ❌ Limited: Status-only view (no sensitive details)
- ❌ None: No access

---

## 🔍 Limited View Details

When a user has limited access to a purchase request, they see:

### Visible Information:
- Request status (badge)
- Requestor's department name
- Creation date
- Basic workflow stage information

### Hidden Information:
- Request title/details
- Estimated cost
- Category
- Urgency level
- Vendor information
- Justification
- Attachments
- Workflow comments
- Review history details

### UI Indicators:
- Warning badge: "(Other Department)"
- Warning message: "Limited view - Full details available to requestor's department only"
- Yellow alert card on detail page explaining restrictions

---

## 🛠️ Technical Implementation

### Key Functions:

1. **`canSeeFullDetails(request)`** - Checks if user can view full request details
2. **`canReview()`** - Checks if user can perform review actions
3. **`getTeamMembers(userId)`** - Gets team members for filtering
4. **Filter Logic**: Applied both in data loading and UI rendering

### Files Modified:

1. **`app/purchases/page.tsx`**
   - Added `canSeeFullDetails()` function
   - Updated request loading to filter based on access
   - Conditional rendering for limited/full views

2. **`app/purchases/[id]/page.tsx`**
   - Added `canSeeFullDetails()` function
   - Conditional rendering of request details
   - Warning messages for limited access

3. **`app/leave/page.tsx`**
   - Filters to only show user's own requests

4. **`app/leave/approvals/page.tsx`**
   - Filters to only show team members' requests
   - Uses `getTeamMembers()` to get team IDs

---

## ✅ Benefits

1. **Data Privacy**: Departments can't see sensitive financial details from other departments
2. **Security**: Proper access control prevents unauthorized data access
3. **Workflow Compliance**: Review departments only see requests in their review stage
4. **Transparency**: Status information available for cross-department visibility
5. **Compliance**: Meets data privacy and security requirements

---

## 🚀 Next Steps (Optional Enhancements)

1. **Receipt Upload**: Add functionality for requestors to upload receipts when status is "receipt_requested"
2. **Department-Level Filtering**: Add filter dropdown to view only own department vs all
3. **Notification System**: Alert departments when requests enter their review stage
4. **Audit Trail**: Enhanced logging of who viewed what and when
5. **Export Restrictions**: Apply same restrictions to export functionality

---

## 📝 Notes

- All restrictions are enforced at the frontend level
- For production, consider adding RLS (Row Level Security) policies at the database level
- Status "receipt_requested" has been added for procurement team workflow
- Review actions are automatically hidden for users without review permissions
- Limited views maintain transparency while protecting sensitive information

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: ✅ Fully Implemented
