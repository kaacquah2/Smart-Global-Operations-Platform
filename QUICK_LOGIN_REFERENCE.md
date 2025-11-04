# Quick Login Reference

## 🔐 All User Login Credentials

### Default Password (Development)
**Password:** `TempPass123!` (Set this when creating auth users)

---

## 👤 Admin
| Email | Name | Role | Branch | Department |
|-------|------|------|--------|------------|
| `admin@sgoap.com` | System Administrator | admin | New York HQ | IT |

---

## 🏢 Headquarters Employees

| Email | Name | Role | Department | Reports To |
|-------|------|------|------------|------------|
| `employee.hq.hr@sgoap.com` | Sarah Johnson | employee | HR | HR Director |
| `employee.hq.finance@sgoap.com` | David Martinez | employee | Finance & Accounting | CFO |
| `employee.hq.marketing@sgoap.com` | Emily Chen | employee | Marketing & Communications | - |

---

## 👔 Headquarters Department Heads

| Email | Name | Role | Department | Position |
|-------|------|------|------------|----------|
| `head.hq.hr@sgoap.com` | Jennifer Thompson | department_head | HR | HR Director |
| `head.hq.finance@sgoap.com` | Robert Anderson | department_head | Finance & Accounting | CFO |
| `head.hq.legal@sgoap.com` | Amanda Williams | department_head | Legal & Compliance | General Counsel |

---

## 🌍 Branch Employees (London Office)

| Email | Name | Role | Department | Reports To |
|-------|------|------|------------|------------|
| `employee.branch.sales@sgoap.com` | James Mitchell | employee | Sales & Business Development | Sales Manager |
| `employee.branch.ops@sgoap.com` | Sophie Brown | employee | Operations & Logistics | - |

---

## 👔 Branch Department Heads (London Office)

| Email | Name | Role | Department | Position |
|-------|------|------|------------|----------|
| `head.branch.sales@sgoap.com` | Michael O'Connor | department_head | Sales & Business Development | Sales Manager |
| `head.branch.finance@sgoap.com` | Lisa Chang | department_head | Finance & Accounting | Finance Manager |

---

## 📋 Quick Setup Checklist

1. ✅ Create branches (auto-created by script)
2. ✅ Create departments (auto-created by script)
3. ⚠️ **Create auth users** in Supabase Dashboard
   - Go to Authentication > Users > Add User
   - Use emails from table above
   - Set password: `TempPass123!`
   - Enable "Auto Confirm"
4. ✅ Run `supabase-user-login-credentials.sql`
5. ✅ Test login for each user

---

## 🧪 Test Login Sequence

1. **Admin:** Full system access
2. **HQ Head:** Can review work, create purchase requests
3. **HQ Employee:** Can submit work, apply for leave
4. **Branch Head:** Can review branch work, create requests
5. **Branch Employee:** Can submit work, apply for leave

---

## 🔑 Permission Summary

### Admin (`admin`)
- ✅ Full system access
- ✅ Manage all users
- ✅ View all departments/branches
- ✅ Access all dashboards

### Department Head (`department_head`)
- ✅ Review work submissions
- ✅ Create purchase requests
- ✅ Approve/reject leave requests
- ✅ View department dashboard
- ✅ Manage department employees

### Employee (`employee`)
- ✅ Submit work for review
- ✅ Apply for leave
- ✅ View tasks
- ✅ Create purchase requests (draft)
- ✅ View announcements, events, policies

---

## 📞 Need Help?

See `USER_LOGIN_CREDENTIALS_GUIDE.md` for detailed setup instructions.

