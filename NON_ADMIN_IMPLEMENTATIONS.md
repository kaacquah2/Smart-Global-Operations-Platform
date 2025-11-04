# Non-Admin Pages Implementation Plan

## Overview
This document outlines all the implementations and improvements that can be made to non-admin pages to enhance functionality, security, and user experience.

---

## 🎯 Priority 1: Department-Based Filtering & Access Control

### 1. **Tasks Page** (`/tasks`)
**Current**: Employees/managers see only assigned tasks
**Improvements Needed**:
- ✅ Department heads should see all tasks from their department
- ✅ Show department filter dropdown
- ✅ Department statistics view
- ✅ Task assignment capability for department heads

### 2. **Organization/Directory** (`/organization`)
**Current**: Shows all users
**Improvements Needed**:
- ✅ Filter users by department (default: own department)
- ✅ Filter by branch
- ✅ Department-specific directory view
- ✅ Hide sensitive employee info from other departments

### 3. **My Department** (`/employee/my-department`)
**Current**: Shows mock data
**Improvements Needed**:
- ✅ Connect to real database queries
- ✅ Show actual department members
- ✅ Real task statistics
- ✅ Real performance metrics
- ✅ Department-specific announcements

### 4. **Messages** (`/messages`)
**Current**: Shows all conversations
**Improvements Needed**:
- ✅ Filter conversations by department
- ✅ Show department-based group chats
- ✅ Auto-filter to department conversations by default
- ✅ Mark messages as department-wide announcements

### 5. **Assets** (`/assets`)
**Current**: Shows all assets
**Improvements Needed**:
- ✅ Filter by assigned department
- ✅ Show only assets assigned to user's department
- ✅ Department heads see all department assets
- ✅ Request asset assignment functionality

### 6. **Events** (`/events`)
**Current**: Shows all events
**Improvements Needed**:
- ✅ Already filtered by department via `getEvents()` - verify implementation
- ✅ Department calendar view
- ✅ Department-specific event creation

### 7. **Policies** (`/policies`)
**Current**: Shows all policies
**Improvements Needed**:
- ✅ Filter by applicable roles/departments
- ✅ Show only policies relevant to user's role
- ✅ Department-specific policy sections

---

## 🎯 Priority 2: Enhanced Features & Functionality

### 8. **Work Submissions** (`/employee/my-submissions`)
**Current**: Shows all user's submissions
**Improvements Needed**:
- ✅ Add department filter (if user has multiple departments)
- ✅ Show submission status history
- ✅ Comparison with team average
- ✅ Resubmission capability

### 9. **Department Dashboard** (`/department/dashboard`)
**Current**: Shows team data
**Improvements Needed**:
- ✅ Verify department filtering is working
- ✅ Add department budget overview
- ✅ Department goal tracking
- ✅ Cross-department collaboration requests

### 10. **Team Page** (`/team`)
**Current**: May show all teams
**Improvements Needed**:
- ✅ Filter by department
- ✅ Show only team members from same department
- ✅ Department hierarchy visualization

### 11. **Vendors** (`/vendors`)
**Current**: Shows all vendors
**Improvements Needed**:
- ✅ Filter vendors by department usage
- ✅ Show which departments use which vendors
- ✅ Department-specific vendor preferences

---

## 🎯 Priority 3: Analytics & Reporting

### 12. **Analytics** (`/analytics`)
**Current**: General analytics
**Improvements Needed**:
- ✅ Department-specific analytics view
- ✅ Compare department performance
- ✅ Department KPI tracking
- ✅ Export department reports

### 13. **Department-Specific Dashboards**
**Current**: Finance/Procurement/Legal/Audit dashboards exist
**Improvements Needed**:
- ✅ Verify department filtering
- ✅ Add remaining department dashboards (HR, IT, Sales, etc.)
- ✅ Department head customization options

---

## 🎯 Priority 4: User Experience Enhancements

### 14. **Submit Work** (`/employee/submit-work`)
**Current**: Basic submission
**Improvements Needed**:
- ✅ Department-based templates
- ✅ Pre-fill department information
- ✅ Department-specific approval workflows
- ✅ File upload improvements

### 15. **Notifications** (`/notifications`)
**Current**: General notifications
**Improvements Needed**:
- ✅ Filter by department
- ✅ Department-specific notification preferences
- ✅ Priority-based sorting

### 16. **Profile** (`/profile`)
**Current**: Basic profile
**Improvements Needed**:
- ✅ Department-specific profile sections
- ✅ Skills/certifications by department
- ✅ Department achievements
- ✅ Team member connections

---

## 📋 Implementation Summary

### Files to Create/Modify:

1. ✅ **Tasks Page** - Add department filtering
2. ✅ **Organization Page** - Department-based filtering
3. ✅ **My Department** - Real data integration
4. ✅ **Messages** - Department filtering
5. ✅ **Assets** - Department assignment filtering
6. ✅ **Vendors** - Department usage filtering
7. ✅ **Team Page** - Department scoping
8. ✅ **Work Submissions** - Enhanced features
9. ✅ **Department Dashboards** - Verify and enhance

---

## 🔒 Access Control Rules

### General Principles:
- **Employees**: See only their own data and same department data
- **Department Heads**: See all data from their department + their own
- **Managers**: See their team's data across departments they manage
- **Executives/CEO**: See all data
- **Admin**: See all data (separate implementation)

### Department Isolation:
- Each department sees only their own sensitive data
- Status information may be visible for transparency
- Cross-department collaboration requires explicit permissions

---

**Status**: Planning Phase
**Next Steps**: Implement Priority 1 items
