# User Management System

## Overview

The User Management system provides a comprehensive interface for managing users, roles, and permissions within the JKKN Service Management platform. This system is built with real-time Supabase integration and features role-based access control.

## Features

### ✅ Implemented Features

1. **Real-time User Management**
   - Live updates when users are created, modified, or deleted
   - Real-time statistics updates
   - Supabase real-time subscriptions

2. **Role-based Access Control**
   - Three user roles: `admin`, `staff`, `student`
   - Inline role editing with dropdown selectors
   - Role-based statistics and filtering

3. **User Operations**
   - Create new users with email, name, and role
   - Edit user profiles (name, role, status)
   - Toggle user status (active/inactive)
   - Soft delete (deactivate) users

4. **Advanced UI/UX**
   - Modern card-based statistics dashboard
   - Advanced search and filtering
   - Loading states and error handling
   - Responsive design for all screen sizes

5. **Data Security**
   - Row Level Security (RLS) policies
   - Proper authentication checks
   - Admin-only user management operations

## Database Structure

### Profiles Table

```sql
public.profiles {
  id: UUID (Primary Key, references auth.users)
  email: TEXT
  full_name: TEXT
  avatar_url: TEXT
  role: TEXT ('admin' | 'staff' | 'student')
  status: TEXT ('active' | 'inactive')
  last_sign_in_at: TIMESTAMPTZ
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
}
```

### Key Database Features

- **Constraints**: Role and status validation
- **Indexes**: Optimized queries for role, status, and email
- **RLS Policies**: Secure access control
- **Triggers**: Automatic profile creation for new users

## API Structure

### Core Functions

```typescript
// User CRUD Operations
getAllUsers(): Promise<UserProfile[]>
getUserById(id: string): Promise<UserProfile | null>
createUser(userData: CreateUserData): Promise<UserProfile>
updateUser(id: string, userData: UpdateUserData): Promise<UserProfile>
deleteUser(id: string): Promise<void>

// Role and Status Management
updateUserRole(userId: string, newRole: UserRole): Promise<void>
toggleUserStatus(userId: string): Promise<UserStatus>

// Analytics and Search
getUserStats(): Promise<UserStats>
searchUsers(query: string): Promise<UserProfile[]>

// Real-time Subscriptions
subscribeToUserChanges(callback: (users: UserProfile[]) => void)
```

### Types

```typescript
type UserRole = 'admin' | 'staff' | 'student'
type UserStatus = 'active' | 'inactive'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  role: UserRole
  status: UserStatus
  last_sign_in_at?: string
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  adminUsers: number
  staffUsers: number
  studentUsers: number
  inactiveUsers: number
}
```

## Components

### Main Components

1. **UserManagementPage** (`/app/user-management/page.tsx`)
   - Main user management interface
   - Statistics dashboard
   - User table with actions
   - Search and filtering

2. **AddUserDialog** 
   - Modal for creating new users
   - Form validation
   - Role selection

3. **EditUserDialog**
   - Modal for editing existing users
   - Email field disabled (non-editable)
   - Role and status updates

### Hooks

1. **useUserManagement** (`/hooks/useUserManagement.ts`)
   - State management for user operations
   - Real-time subscription handling
   - Error handling and toast notifications

## Key Improvements Over Previous Version

### ❌ Removed (Mock Data Era)
- Mock user data and fallback systems
- Activity tracking (problems/solutions)
- Complex role array structures
- Database fallback mechanisms

### ✅ Added (Real Supabase Integration)
- Real-time data synchronization
- Proper Supabase auth integration
- Simplified role management (single role per user)
- Enhanced error handling with specific error messages
- Modern UI with improved statistics cards
- Inline role editing functionality
- Database migrations for proper schema

## Security Features

### Row Level Security (RLS)

```sql
-- Read access for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admin users can manage all profiles
CREATE POLICY "Admin users can manage all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

## Setup Instructions

### 1. Database Migration

Run the migration to set up the user management schema:

```bash
# Apply the migration
supabase db push
```

### 2. Environment Setup

Ensure your Supabase environment variables are configured:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Admin User Setup

The system automatically assigns admin role to the first user. For manual setup:

```sql
UPDATE public.profiles 
SET role = 'admin', status = 'active'
WHERE email = 'your_admin_email@example.com';
```

## Usage Guide

### For Admins

1. **Access**: Navigate to `/user-management`
2. **View Statistics**: Dashboard shows user counts by role and status
3. **Create Users**: Click "Add User" button
4. **Edit Users**: Use dropdown menu in Actions column
5. **Change Roles**: Click on role badge to change inline
6. **Search/Filter**: Use search bar and filter dropdowns

### For Developers

1. **Real-time Updates**: Subscribe to user changes using `subscribeToUserChanges()`
2. **Error Handling**: All functions return proper error messages
3. **Loading States**: Use `actionLoading` state for UI feedback
4. **Type Safety**: Full TypeScript support with proper interfaces

## Real-time Features

The system uses Supabase real-time subscriptions to provide live updates:

```typescript
// Automatic setup in useUserManagement hook
const subscription = subscribeToUserChanges((updatedUsers) => {
  setUsers(updatedUsers);
  updateStats();
});

// Cleanup on unmount
return () => subscription.unsubscribe();
```

## Error Handling

Comprehensive error handling with user-friendly messages:

- Network errors
- Authentication failures
- Permission denied
- Validation errors
- Database constraints

## Performance Optimizations

1. **Database Indexes**: Optimized queries for role, status, email
2. **Real-time Subscriptions**: Only update when necessary
3. **Debounced Search**: Efficient search functionality
4. **Optimistic Updates**: Immediate UI feedback

## Future Enhancements

- [ ] Bulk user operations
- [ ] User import/export functionality
- [ ] Advanced permission management
- [ ] User activity logging
- [ ] Email invitation system
- [ ] Two-factor authentication setup

## Testing

To test the user management system:

1. Create test users with different roles
2. Verify real-time updates work across browser tabs
3. Test role changes and status toggles
4. Verify search and filtering functionality
5. Test error handling with invalid operations

## Troubleshooting

### Common Issues

1. **Users not loading**: Check RLS policies and authentication
2. **Real-time not working**: Verify Supabase subscription setup
3. **Permission denied**: Ensure user has admin role
4. **Database errors**: Check migration was applied correctly

### Debug Steps

1. Check browser console for errors
2. Verify Supabase connection
3. Check user authentication status
4. Review RLS policy logs in Supabase dashboard 