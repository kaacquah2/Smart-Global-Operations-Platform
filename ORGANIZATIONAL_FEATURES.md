# Organizational Features Documentation

## Overview
This document outlines all the organizational features added to SGOAP (Smart Global Operations Platform) to make it a comprehensive enterprise management system.

## Features Added

### 1. Leave Management System ✅
**Location:** `/leave`

**Features:**
- View leave balance by type (Annual, Sick, Personal, etc.)
- Apply for leave with start/end dates
- Track used, pending, and remaining leave days
- Leave request status tracking (pending, approved, rejected)
- Automatic balance calculation
- Manager approval workflow
- Real-time updates

**Database Tables:**
- `leave_types` - Types of leave (Annual, Sick, etc.)
- `leave_balances` - User leave balance per year per type
- `leave_requests` - Leave applications
- `leave_calendar` - Calendar tracking for team visibility

**User Capabilities:**
- Employees can view their balance and submit requests
- Managers can view team requests and approve/reject
- Automatic balance deduction on approval

### 2. Announcements System
**Location:** `/announcements` (to be created)

**Features:**
- Company-wide announcements
- Targeted announcements (by role, department, branch)
- Priority levels (low, normal, high, urgent)
- Announcement types (general, important, urgent, event, policy_update)
- Pinned announcements
- Expiry dates
- View tracking

**Database Tables:**
- `announcements` - Announcement posts
- `announcement_views` - Track who viewed what

### 3. Events & Calendar
**Location:** `/events` or `/calendar` (to be created)

**Features:**
- Company events (meetings, training, workshops)
- RSVP functionality
- Event types (meeting, training, workshop, social, holiday, deadline)
- Target audience filtering
- Virtual meeting links
- Attendance tracking

**Database Tables:**
- `events` - Event information
- `event_attendees` - RSVP and attendance

### 4. Policies & Documents
**Location:** `/policies` (to be created)

**Features:**
- Policy library with categories
- Version control
- Role-based access
- Policy acknowledgments
- Document attachments
- Search and filter

**Database Tables:**
- `policy_categories` - Policy organization
- `policies` - Policy documents
- `policy_acknowledgments` - Track who acknowledged policies

### 5. Asset Management
**Location:** `/assets` (to be created)

**Features:**
- Track company assets (laptops, phones, equipment)
- Asset assignment to employees
- Asset history tracking
- Maintenance scheduling
- Asset categories
- Location tracking

**Database Tables:**
- `asset_categories` - Asset organization
- `assets` - Asset records
- `asset_assignments` - Assignment history

### 6. Training & Development
**Location:** `/training` (to be created)

**Features:**
- Training program catalog
- Employee enrollment
- Progress tracking
- Certification management
- Mandatory training tracking
- Training history

**Database Tables:**
- `training_programs` - Available training
- `training_records` - Employee training history

### 7. Performance Reviews
**Location:** `/reviews` (to be created)

**Features:**
- Review cycles (annual, quarterly, etc.)
- Self-review and manager review
- Rating criteria
- Goals tracking
- Review history
- Performance analytics

**Database Tables:**
- `review_cycles` - Review periods
- `performance_reviews` - Review records
- `review_ratings` - Detailed ratings

### 8. Knowledge Base
**Location:** `/knowledge` (to be created)

**Features:**
- Article library
- Categorized content
- Search functionality
- Helpful/not helpful feedback
- Featured articles
- Tags system

**Database Tables:**
- `kb_categories` - Content organization
- `kb_articles` - Knowledge articles
- `kb_feedback` - User feedback

### 9. Organizational Chart
**Location:** `/org-chart` (to be created)

**Features:**
- Visual hierarchy display
- Department structure
- Reporting relationships
- Interactive org chart

**Database Tables:**
- `org_chart` - Organizational positions

## Database Migration Files

1. **supabase-migration.sql** - Core tables (already exists)
2. **supabase-organizational-features.sql** - NEW - All organizational feature tables
3. **supabase-organizational-seed.sql** - NEW - Seed data for organizational features

## Implementation Status

✅ **Completed:**
- Database schema for all features
- Leave management system (full implementation)
- Leave queries and functions
- Leave management page (`/leave`)

🔄 **In Progress:**
- Additional organizational pages
- Navigation updates
- Real-time subscriptions

⏳ **Pending:**
- Announcements page
- Events/Calendar page
- Policies page
- Assets page
- Training page
- Performance Reviews page
- Knowledge Base page
- Org Chart page

## Usage Instructions

### Setting Up Leave Management

1. Run migration files in order:
   ```sql
   -- 1. Core tables (if not already done)
   -- Run: supabase-migration.sql
   
   -- 2. Organizational features
   -- Run: supabase-organizational-features.sql
   
   -- 3. Seed data
   -- Run: supabase-organizational-seed.sql
   ```

2. Leave balances are automatically initialized for all users when seed data runs

3. Access leave management at `/leave`

### Leave Request Flow

1. Employee views leave balance
2. Employee submits leave request with dates and reason
3. Request shows as "pending" and pending balance is updated
4. Manager receives notification (if implemented)
5. Manager approves/rejects request
6. If approved:
   - Status changes to "approved"
   - Used balance increases
   - Pending balance decreases
   - Remaining balance decreases

### Leave Balance Calculation

- **Total Allotted:** Max days per year + carried forward (if applicable)
- **Used:** Approved leave days
- **Pending:** Pending approval leave days
- **Remaining:** Total Allotted - Used - Pending
- **Carried Forward:** Unused days from previous year (if enabled)

## Navigation Updates Needed

Add to `components/role-based-nav.tsx`:

```typescript
{
  icon: <Calendar className="h-5 w-5" />,
  label: "Leave",
  href: "/leave",
  roles: ["employee", "department_head", "manager", "executive", "ceo", "admin"],
},
{
  icon: <Megaphone className="h-5 w-5" />,
  label: "Announcements",
  href: "/announcements",
  roles: ["employee", "department_head", "manager", "executive", "ceo", "admin"],
},
// ... more items
```

## Security & Permissions

All features include Row Level Security (RLS) policies:
- Users can view their own data
- Managers can view team data
- Admins have full access
- Role-based filtering for announcements/events

## Real-time Features

Real-time subscriptions enabled for:
- Leave requests
- Announcements
- Events
- Notifications (already exists)

## Next Steps

1. Create remaining organizational pages
2. Add manager approval workflow UI
3. Add leave calendar view
4. Implement announcement composer
5. Add event RSVP functionality
6. Create policy viewer with acknowledgment
7. Build asset assignment interface
8. Add training enrollment
9. Create performance review forms
10. Build knowledge base search

## API Functions Available

All query functions are in `lib/supabase/queries.ts`:

**Leave Management:**
- `getLeaveTypes()`
- `getLeaveBalance(userId, year?)`
- `getLeaveRequests(userId?, status?)`
- `createLeaveRequest(requestData)`
- `approveLeaveRequest(requestId, approverId)`
- `rejectLeaveRequest(requestId, approverId, reason)`
- `subscribeToLeaveRequests(userId, callback)`

**Organizational:**
- `getAnnouncements(userId)`
- `getEvents(userId, startDate?, endDate?)`
- `getPolicies()`

