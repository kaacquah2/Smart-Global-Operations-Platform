# Password Reset Implementation - Initials + Year Joined

## Overview

The password reset system has been updated to generate passwords based on user initials and year joined, making them easier to remember while maintaining security.

## Password Format

**Format:** `Initials + Year Joined + Special Character + Number`

**Example:**
- User: "John Smith" joined in 2024 → Password: `JS2024!3`
- User: "Sarah Johnson" joined in 2023 → Password: `SJ2023@5`

### Password Components:
1. **Initials (2 letters)**: Extracted from user's name
   - If name has multiple parts: First letter of first name + First letter of last name
   - If single name: First two characters
   - Default: "US" if name unavailable
2. **Year (4 digits)**: Extracted from `hire_date` field
   - Uses the year from the user's hire date
   - Falls back to current year if hire_date unavailable
3. **Special Character (1)**: Randomly selected from `!@#$%^&*`
4. **Number (1)**: Random digit (0-9)

**Total Length:** 8+ characters (meets security requirements)

## Implementation Details

### Files Modified:

1. **`app/api/auth/reset-password/route.ts`**
   - New function: `generatePasswordFromUserInfo(name, hireDate)`
   - Fetches user details (name, hire_date) when processing reset request
   - Updated email templates with password format explanation

2. **`app/admin/password-resets/page.tsx`**
   - Updated confirmation dialog to explain password format
   - Shows example password format to admin

3. **`lib/supabase/queries.ts`**
   - Fixed `getUserByEmail()` to use `.maybeSingle()` instead of `.single()` for better error handling
   - Fixed `getUserById()` to check `is_active` status for consistency
   - Added try-catch blocks for better error handling

### Password Generation Logic:

```typescript
function generatePasswordFromUserInfo(name: string | null, hireDate: string | null): string {
  // Extract initials from name
  // Extract year from hire_date
  // Combine: Initials + Year + SpecialChar + Number
  // Example: "JS2024!3"
}
```

### Email Template Updates:

- **HTML Email**: Includes password format explanation
- **Text Email**: Plain text version with same information
- **Security Notice**: Enhanced with bullet points about password security

## Security Considerations

✅ **Strengths:**
- Passwords are unique per user (based on initials + year)
- Includes special characters and numbers
- Meets minimum length requirements (8+ characters)
- Easy for users to remember their own password

⚠️ **Recommendations:**
1. **Force Password Change**: Users should change password immediately after first login
2. **Password History**: Consider tracking password history to prevent reuse
3. **Password Complexity**: Consider adding more complexity requirements if needed
4. **Account Lockout**: Implement account lockout after failed attempts

## Admin Workflow

1. Admin receives password reset request notification
2. Admin navigates to `/admin/password-resets`
3. Admin views pending requests
4. Admin clicks "Process Request"
5. System:
   - Fetches user details (name, hire_date)
   - Generates password: `Initials + Year + SpecialChar + Number`
   - Updates password in Supabase Auth
   - Sends email to user with new password
   - Marks request as completed

## User Experience

1. User requests password reset via "Forgot?" link on login page
2. User receives confirmation that request was submitted
3. Admin processes request
4. User receives email with:
   - New password (formatted clearly)
   - Password format explanation
   - Security instructions
   - Login link

## Error Handling

- **Missing Name**: Defaults to "US" initials
- **Missing Hire Date**: Uses current year
- **User Not Found**: Proper error message returned
- **Email Send Failure**: Admin sees password in response for manual sending

## Testing Checklist

- [ ] Test password generation with various name formats
- [ ] Test password generation with/without hire_date
- [ ] Test password reset flow end-to-end
- [ ] Test email delivery (HTML and text versions)
- [ ] Test admin confirmation dialog
- [ ] Test login with new password
- [ ] Test error scenarios (missing user, failed email, etc.)

## Future Enhancements

1. **Password Expiry**: Set expiration date for temporary passwords
2. **Password Strength Indicator**: Show password strength in admin UI
3. **Bulk Password Reset**: Allow admins to reset multiple passwords
4. **Password Templates**: Allow customization of password format
5. **Audit Logging**: Log all password resets for security auditing

