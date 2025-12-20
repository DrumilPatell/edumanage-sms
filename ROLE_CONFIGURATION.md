# Role-Based Access Control Configuration

## Overview
The system now supports automatic role assignment based on email addresses. Users are assigned roles (Admin, Faculty, or Student) when they log in via OAuth.

## How It Works

### 1. Email-Based Role Assignment
When a user logs in for the first time, the system checks their email against configured lists:
- **Admin**: Full access to all features (add, edit, delete)
- **Faculty**: Can manage students, courses, attendance, and grades (add, edit, delete)
- **Student**: View-only access to courses and grades (cannot edit or delete)

### 2. Configuration in `.env` File

Edit the `backend/.env` file to configure role assignments:

```env
# Admin Emails (comma-separated)
ADMIN_EMAILS=admin1@example.com,admin2@example.com,drumilpatel0987@gmail.com

# Faculty Emails (comma-separated)
FACULTY_EMAILS=professor1@university.edu,teacher2@school.edu,faculty@example.com

# Student Emails (comma-separated)
STUDENT_EMAILS=student1@university.edu,student2@school.edu,john.doe@example.com
```

### 3. Adding New Users

**To add a new Admin:**
1. Open `backend/.env`
2. Add their email to `ADMIN_EMAILS` (comma-separated)
3. Restart the backend server

**To add a new Faculty:**
1. Open `backend/.env`
2. Add their email to `FACULTY_EMAILS` (comma-separated)
3. Restart the backend server

**To add a new Student:**
1. Open `backend/.env`
2. Add their email to `STUDENT_EMAILS` (comma-separated)
3. Restart the backend server

### 4. Role Priority
If an email appears in multiple lists, the system assigns roles in this priority:
1. Admin (highest priority)
2. Faculty
3. Student (default for any email not in other lists)

## Access Control by Role

### Admin Access
- ✅ View all pages
- ✅ Add new records (users, students, courses, enrollments, grades, attendance)
- ✅ Edit all records
- ✅ Delete all records

Pages accessible:
- Dashboard
- Users
- Students
- Courses
- Enrollments
- Attendance
- Grades

### Faculty Access
- ✅ View students, courses, attendance, grades
- ✅ Add new records (students, courses, grades, attendance)
- ✅ Edit records (students, courses, grades, attendance)
- ✅ Delete records (students, courses, grades, attendance)
- ❌ Cannot manage users or enrollments

Pages accessible:
- Dashboard
- Students
- Courses
- Attendance
- Grades

### Student Access
- ✅ View courses and grades
- ❌ Cannot add, edit, or delete any records
- ❌ Shows "View Only" buttons instead of edit/delete

Pages accessible:
- Dashboard
- Courses (view only)
- Grades (view only)

## Example Configuration

```env
# Example: University setup
ADMIN_EMAILS=admin@university.edu,it.admin@university.edu

# All professors get faculty role
FACULTY_EMAILS=prof.smith@university.edu,prof.jones@university.edu,dr.brown@university.edu

# Students (or use domain-based approach below)
STUDENT_EMAILS=john.student@university.edu,jane.doe@university.edu
```

## Default Behavior
- Any email NOT listed in the configuration files will be assigned the **Student** role by default
- This provides a safe fallback for new users

## Testing Roles

1. **Test as Admin:**
   - Add your email to `ADMIN_EMAILS`
   - Login via OAuth
   - You should see all menu items and all action buttons

2. **Test as Faculty:**
   - Add a test email to `FACULTY_EMAILS`
   - Login with that account
   - You should see limited menu items and action buttons

3. **Test as Student:**
   - Add a test email to `STUDENT_EMAILS` (or use any unlisted email)
   - Login with that account
   - You should see "View Only" buttons and limited menu items

## Security Notes
- Role assignment happens at login time
- Roles are stored in the database after first login
- Changing role in `.env` requires the user to logout and login again
- Frontend also validates roles to hide/show UI elements
- Backend API endpoints enforce role-based permissions

## Troubleshooting

**User has wrong role:**
1. Check `.env` file for correct email spelling
2. Restart backend server: `uvicorn main:app --reload`
3. User must logout and login again
4. Check database `users` table to verify role was updated

**Buttons not showing/hiding correctly:**
1. Clear browser cache and localStorage
2. Logout and login again
3. Check browser console for errors

**Cannot access certain pages:**
1. Verify role in database matches expected role
2. Check `DashboardLayout.jsx` navigation configuration
3. Check `App.jsx` route permissions
