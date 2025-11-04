# User Dashboard Redirect & Navigation Guide

## ✅ Automatic Dashboard Redirects

When users log in, they are **automatically redirected** to their role-specific dashboard with appropriate navigation tabs.

## 🔄 Login Flow

1. User enters credentials on `/auth/login`
2. After successful login → redirected to `/dashboard`
3. `/dashboard` page automatically detects user role and redirects to:
   - **Admin** → `/admin/employees`
   - **Employee** → `/employee/dashboard`
   - **Department Head** → Department-specific dashboard (see below)
   - **Manager** → `/manager/dashboard`
   - **Executive** → `/executive/dashboard`
   - **CEO** → `/ceo/dashboard`

## 🎯 Department Head Smart Redirects

Department Heads are **automatically redirected** to their department-specific dashboard:

| Department | Redirects To | Dashboard Features |
|------------|-------------|-------------------|
| **Finance & Accounting** | `/finance/dashboard` | Budget tracking, purchase reviews, financial metrics |
| **Procurement & Supply-Chain** | `/procurement/dashboard` | Vendor management, procurement reviews, inventory |
| **Legal & Compliance** | `/legal/dashboard` | Legal reviews, compliance cases, contract tracking |
| **Audit** | `/audit/dashboard` | Audit cases, risk tracking, compliance reports |
| **Other Departments** | `/department/dashboard` | General department dashboard with team stats |

## 📋 Navigation Tabs (Role-Based)

### All Users See:
- **Dashboard** - Role-specific dashboard
- **Leave** - Leave management
- **Announcements** - Company announcements
- **Organization** - Company directory and resources
- **Settings** - User settings

### Employees See:
- **Submit Work** - Submit work for review
- **My Submissions** - View submitted work
- **My Department** - Department information

### Department Heads See:
- **Reviews** - Review work submissions from team
- **Purchases** - Create and manage purchase requests
- **Department Dashboard** - Department-specific dashboard (Finance/Legal/Procurement/Audit)
- **Analytics** (if manager/executive)

### Finance Department Heads See:
- **Finance Dashboard** - Financial metrics and reviews
- All standard department head features

### Procurement Department Heads See:
- **Procurement Dashboard** - Procurement-specific metrics
- All standard department head features

### Legal Department Heads See:
- **Legal Dashboard** - Legal review cases
- All standard department head features

### Audit Department Heads See:
- **Audit Dashboard** - Audit cases and risk tracking
- All standard department head features

### Admins See:
- **Employees** - User management
- **Purchases** - All purchase requests
- All department dashboards (if they belong to those departments)

### Managers/Executives/CEO See:
- **Analytics** - Company-wide analytics
- **Workflows** - Workflow management
- **Employees** - User management (executives/CEO)

## 🎨 Dashboard Features by Role

### Employee Dashboard (`/employee/dashboard`)
- Personal task overview
- Task completion stats
- Work submissions
- Upcoming deadlines
- Quick actions (Submit Work, Apply for Leave)

### Department Head Dashboard (`/department/dashboard`)
- Team performance metrics
- Pending reviews count
- Department efficiency stats
- Team member performance charts
- Quick access to reviews

### Finance Dashboard (`/finance/dashboard`)
- Pending purchase request reviews
- Total pending value
- High-value requests alert
- Budget status
- Quick links to all purchase requests

### Procurement Dashboard (`/procurement/dashboard`)
- Pending procurement reviews
- Vendor tracking
- Purchase request management
- Procurement metrics

### Legal Dashboard (`/legal/dashboard`)
- Purchase request legal reviews
- Legal case management
- Compliance tracking
- Priority cases

### Audit Dashboard (`/audit/dashboard`)
- Audit review requests
- Risk level tracking
- Audit case management
- Compliance monitoring

### Admin Dashboard (`/admin/employees`)
- User management
- Create/edit/delete users
- User roles and permissions
- System administration

## 🔐 Access Control

- **Navigation tabs** are automatically filtered based on:
  1. User role
  2. Department (for department-specific dashboards)
  3. Permissions

- **Dashboards** are protected by:
  - Authentication check
  - Role-based access
  - Department-based access (for specialized dashboards)

## 📱 Responsive Design

- **Desktop**: Full navigation bar with all tabs visible
- **Mobile**: Hamburger menu with collapsible navigation
- **Global Search**: Available in navbar (Ctrl/Cmd + K)

## 🔄 Real-Time Updates

All dashboards include:
- Real-time data updates via Supabase subscriptions
- Live notifications
- Instant status changes

## 🎯 Example Login Scenarios

### Scenario 1: HR Employee
1. Logs in with `employee.hq.hr@sgoap.com`
2. Redirected to → `/employee/dashboard`
3. Sees tabs: Dashboard, Submit Work, My Submissions, My Department, Leave, Announcements, Organization, Settings
4. Can submit work, apply for leave, view tasks

### Scenario 2: Finance Department Head
1. Logs in with `head.hq.finance@sgoap.com`
2. Redirected to → `/finance/dashboard` (automatic!)
3. Sees tabs: Dashboard, Reviews, Purchases, **Finance**, Leave, Announcements, Organization, Settings
4. Can review purchase requests, manage finance workflows, approve/reject requests

### Scenario 3: Branch Sales Manager
1. Logs in with `head.branch.sales@sgoap.com`
2. Redirected to → `/department/dashboard` (no specialized dashboard for Sales)
3. Sees tabs: Dashboard, Reviews, Purchases, Leave, Announcements, Organization, Settings
4. Can review work submissions, create purchase requests, manage team

### Scenario 4: Admin
1. Logs in with `admin@sgoap.com`
2. Redirected to → `/admin/employees`
3. Sees tabs: Dashboard, Purchases, **Finance** (if in Finance dept), Leave, Announcements, Organization, **Employees**, Settings
4. Can manage all users, view all data, access all features

## 🛠️ Customization

To add more department-specific dashboards:

1. Create dashboard page: `/app/[department]/dashboard/page.tsx`
2. Update redirect logic in `/app/dashboard/page.tsx`
3. Add navigation item in `components/role-based-nav.tsx` with condition
4. Ensure department name matches exactly in database

## ✅ Verification Checklist

After logging in, verify:
- [ ] Redirected to correct dashboard
- [ ] Navigation tabs are appropriate for role
- [ ] Department-specific dashboard visible (if applicable)
- [ ] Can access all expected features
- [ ] Cannot access restricted features
- [ ] Global search works (Ctrl/Cmd + K)
- [ ] Real-time updates working

---

**Note:** If a user doesn't see expected tabs or dashboards, check:
1. User role is correct in database
2. Department name matches exactly (case-sensitive)
3. Navigation conditions are met
4. RLS policies allow access

