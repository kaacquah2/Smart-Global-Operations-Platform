# Department Workflow Implementation Guide

## Overview

This implementation adds comprehensive workflow management for departments, including:
- Work submission reviews by department heads
- Purchase request workflows (Finance → Procurement → Legal → Audit → CEO)
- Department-specific dashboards
- Inter-department communication channels

## Database Schema

### New Tables Created

1. **Purchase Requests** (`purchase_requests`)
   - Tracks purchase requests with multi-stage approval workflow
   - Status flow: `draft` → `submitted` → `finance_review` → `procurement_review` → `legal_review` → `audit_review` → `executive_approval` → `approved`

2. **Purchase Workflow Log** (`purchase_workflow_log`)
   - Tracks all review actions in the purchase request workflow
   - Records who reviewed, when, and with what comments

3. **Legal Reviews** (`legal_reviews`)
   - Tracks legal and compliance review cases
   - Can be linked to purchase requests or standalone

4. **Audit Cases** (`audit_cases`)
   - Tracks audit cases for financial, compliance, operational reviews
   - Can be linked to purchase requests or other documents

5. **Department Metrics** (`department_metrics`)
   - Tracks department-specific KPIs and metrics

6. **Department Threads** (`department_threads`)
   - Formal inter-department communication channels
   - Links to purchase requests, work submissions, etc.

7. **Thread Messages** (`thread_messages`)
   - Messages within department communication threads

### Updated Tables

1. **Work Submissions** (`work_submissions`)
   - Added: `reviewer_id`, `reviewed_at`, `review_notes`, `review_rating`
   - Enables department heads to review employee work submissions

## Department Structure

### Headquarters (New York HQ)
All 12 departments are available:
1. Human Resources (HR)
2. Finance & Accounting
3. Marketing & Communications
4. Sales & Business Development
5. Operations & Logistics
6. Information Technology (IT)
7. Research & Development (R&D)
8. Legal & Compliance
9. Procurement & Supply-Chain
10. Customer Service & Support
11. Facilities & Infrastructure
12. Strategy & Corporate Development

### Branch Offices
Simplified structure with core operational departments:
- Sales & Business Development
- Operations & Logistics
- Customer Service & Support
- Finance & Accounting
- Human Resources (HR)

## Workflow Flows

### Work Submission Review Flow

1. Employee submits work → Status: `submitted`
2. Department head reviews → Can approve or request changes
3. If approved → Status: `approved`
4. If rejected → Status: `rejected` (employee can resubmit)

### Purchase Request Flow

1. **Department Head creates request** → Status: `draft`
2. **Submit for approval** → Status: `submitted`
3. **Finance Review** → Status: `finance_review`
   - Finance department reviews budget impact
   - Can approve, reject, or request changes
4. **Procurement Review** → Status: `procurement_review`
   - Procurement department reviews vendor options
   - Can approve, reject, or request changes
5. **Legal Review** → Status: `legal_review`
   - Legal department reviews contracts and compliance
   - Can approve, reject, or request changes
6. **Audit Review** → Status: `audit_review`
   - Audit department reviews for risk and compliance
   - Can approve, reject, or request changes
7. **Executive Approval** → Status: `executive_approval`
   - CEO/Executives make final decision
   - Can approve or reject
8. **Approved** → Status: `approved`

## Implementation Files

### SQL Migrations

1. `supabase-workflow-approval-system.sql`
   - Creates all workflow-related tables
   - Sets up RLS policies
   - Creates helper functions (`advance_purchase_request`)

2. `supabase-departments-seed.sql`
   - Seeds all 12 departments for HQ
   - Creates simplified departments for branches

### Query Functions (`lib/supabase/queries.ts`)

#### Purchase Request Queries
- `getPurchaseRequests()` - Get purchase requests with filters
- `getPurchaseRequestById()` - Get single request with details
- `createPurchaseRequest()` - Create new request
- `submitPurchaseRequest()` - Submit draft for approval
- `reviewPurchaseRequest()` - Review and advance workflow
- `getPurchaseWorkflowLog()` - Get workflow history

#### Work Submission Queries
- `getWorkSubmissionsForReview()` - Get submissions awaiting review
- `reviewWorkSubmission()` - Approve/reject submission

#### Legal & Audit Queries
- `getLegalReviews()` - Get legal review cases
- `getAuditCases()` - Get audit cases

#### Department Queries
- `getDepartmentById()` - Get department details
- `getDepartmentByName()` - Find department by name
- `getAllDepartments()` - List all departments
- `getDepartmentMetrics()` - Get department KPIs

### Pages Created

1. **Purchase Requests**
   - `/app/purchases/page.tsx` - List all purchase requests
   - `/app/purchases/new/page.tsx` - Create new purchase request
   - `/app/purchases/[id]/page.tsx` - View request details (TODO)

2. **Work Reviews**
   - `/app/department/reviews/page.tsx` - Review employee work submissions (UPDATED)

3. **Department Dashboards** (TODO)
   - Finance dashboard
   - Procurement dashboard
   - Legal dashboard
   - Audit dashboard

## Usage Instructions

### For Employees
1. Submit work: Go to "Submit Work" page
2. Create purchase request: Go to "Purchases" → "New Request"
3. Track status: View your requests in "Purchases" page

### For Department Heads
1. Review work: Go to "Department" → "Reviews"
2. Create purchase request: Same as employees
3. View department metrics: Department dashboard (TODO)

### For Finance
1. View purchase requests in `finance_review` status
2. Review and approve/reject
3. Track budget impact

### For Procurement
1. View purchase requests in `procurement_review` status
2. Review vendor options
3. Approve/reject and move to next stage

### For Legal
1. View purchase requests in `legal_review` status
2. Review contracts and compliance
3. Create legal review cases for complex issues

### For Audit
1. View purchase requests in `audit_review` status
2. Review for risk and compliance
3. Create audit cases as needed

### For CEO/Executives
1. View all purchase requests in `executive_approval` status
2. Make final approval decision
3. Oversee all workflows

## Next Steps

1. Create purchase request detail page (`/app/purchases/[id]/page.tsx`)
2. Create department-specific dashboard pages
3. Add email notifications for workflow stages
4. Implement department metrics tracking UI
5. Add inter-department communication UI

