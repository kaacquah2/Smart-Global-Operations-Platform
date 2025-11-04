# Purchase Requests Seed Data Guide

## 📋 Overview

This guide explains how to seed your database with realistic purchase request data so employees can see purchase requests on the `/purchases` page.

## 🚀 Quick Start

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to SQL Editor

2. **Run the Seed Script**
   - Copy and paste the contents of `supabase-seed-purchase-requests.sql`
   - Click "Run" to execute

3. **Verify Data**
   - Check that purchase requests were created
   - Refresh your `/purchases` page

## 📊 What Gets Created

The seed script creates **30+ realistic purchase requests** across multiple departments with various statuses:

### Status Distribution:
- **Draft** - Requests not yet submitted
- **Submitted** - Awaiting initial review
- **Finance Review** - Being reviewed by Finance
- **Procurement Review** - Being reviewed by Procurement
- **Legal Review** - Being reviewed by Legal
- **Audit Review** - High-value requests requiring audit
- **Approved** - Completed approvals

### Departments Covered:
- ✅ Information Technology (IT)
- ✅ Sales & Business Development
- ✅ Marketing & Communications
- ✅ Finance & Accounting
- ✅ Human Resources (HR)
- ✅ Operations & Logistics
- ✅ Legal & Compliance
- ✅ Procurement & Supply-Chain

### Categories:
- **Equipment** - Laptops, network gear, warehouse equipment, vehicles
- **Software** - Licenses, subscriptions, platforms
- **Supplies** - Office supplies, training materials
- **Services** - Training, consulting, marketing campaigns

### Cost Range:
- Low: $2,800 (office supplies)
- Medium: $5,000 - $18,000 (software licenses, training)
- High: $25,000 - $55,000 (enterprise software, equipment)
- Very High: $75,000 - $95,000 (major purchases, fleet vehicles)

## 📝 Sample Purchase Requests Created

### IT Department:
1. **New Development Laptops** - $12,500 (Draft)
2. **Cloud Infrastructure Subscription** - $35,000 (Submitted)
3. **Security Software License Renewal** - $18,500 (Finance Review)
4. **Network Equipment Upgrade** - $22,000 (Procurement Review)
5. **Enterprise CRM System** - $45,000 (Legal Review)
6. **Backup Storage Solution** - $8,500 (Approved)

### Sales Department:
1. **Trade Show Booth Materials** - $3,200 (Draft)
2. **Client Entertainment Budget** - $5,000 (Submitted)
3. **Sales Training Program** - $12,000 (Finance Review)
4. **Sales Enablement Tools** - $18,000 (Approved)

### Marketing Department:
1. **Video Production Equipment** - $8,500 (Draft)
2. **Digital Marketing Campaign Budget** - $25,000 (Finance Review)
3. **Brand Redesign and Rebranding** - $75,000 (Audit Review)

### Finance Department:
1. **Accounting Software Upgrade** - $15,000 (Submitted)
2. **Financial Analysis Tools** - $12,000 (Approved)
3. **Office Supplies - Q1** - $2,800 (Procurement Review)

### HR Department:
1. **HR Management System** - $28,000 (Submitted)
2. **Employee Training Materials** - $4,500 (Approved)

### Operations Department:
1. **Warehouse Equipment** - $55,000 (Finance Review)
2. **Logistics Software Platform** - $32,000 (Legal Review)
3. **Fleet Vehicle Purchase** - $95,000 (Approved)

### Legal Department:
1. **Legal Research Database Subscription** - $18,000 (Submitted)
2. **Contract Management Software** - $15,000 (Approved)

### Procurement Department:
1. **Vendor Management System** - $25,000 (Finance Review)

## 🔍 How to View Purchase Requests

After seeding:

1. **As an Employee:**
   - Login and go to `/purchases`
   - See purchase requests you created
   - Filter by status

2. **As Finance Head:**
   - See requests in `finance_review` status
   - Can review and approve/reject

3. **As Procurement Head:**
   - See requests in `procurement_review` status
   - Can review vendor information

4. **As Legal Head:**
   - See requests in `legal_review` status
   - Can review compliance

5. **As Executive/CEO:**
   - See all purchase requests
   - View company-wide spending

## ⚙️ Troubleshooting

### Issue: No purchase requests showing
**Solution:**
- Ensure you've run `supabase-seed-all-employees.sql` first (creates users)
- Ensure you've run `create-all-employees-auth.js` (creates auth users)
- Check that departments exist in database
- Verify user email matches seed script

### Issue: Error "department_id not found"
**Solution:**
- Make sure departments table has data
- Check department names match exactly (case-sensitive)

### Issue: Purchase requests created but not visible
**Solution:**
- Check RLS (Row Level Security) policies
- Verify user has permission to view purchase requests
- Check browser console for errors

## 🔄 Re-seeding

If you need to reset and re-seed:

```sql
-- Clear existing purchase requests (careful - this deletes all!)
DELETE FROM public.purchase_workflow_log;
DELETE FROM public.purchase_requests;

-- Then re-run supabase-seed-purchase-requests.sql
```

## 📈 Next Steps

After seeding purchase requests, you can:

1. **Review Workflow:**
   - Test the approval workflow
   - See how requests move through stages

2. **View Details:**
   - Click on any purchase request to see details
   - View workflow history

3. **Create New Requests:**
   - Use the "New Request" button
   - Test creating draft vs submitting immediately

## ✅ Verification Checklist

- [ ] Seed script ran without errors
- [ ] Purchase requests visible on `/purchases` page
- [ ] Different statuses are represented
- [ ] Multiple departments have requests
- [ ] Can filter by status
- [ ] Can click to view request details
- [ ] Finance/Procurement/Legal can see relevant requests

---

**Note:** The seed script uses employee emails from your existing seed data. If employee emails are different, update the script accordingly.

