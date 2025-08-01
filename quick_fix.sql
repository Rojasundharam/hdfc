-- QUICK FIX for policy error
BEGIN;

-- Drop ALL existing policies
DROP POLICY IF EXISTS notifications_insert_own ON public.notifications;
DROP POLICY IF EXISTS notifications_read_own ON public.notifications;
DROP POLICY IF EXISTS notifications_update_own ON public.notifications;
DROP POLICY IF EXISTS notifications_delete_own ON public.notifications;

-- Recreate notification policies
CREATE POLICY notifications_read_own ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notifications_insert_own ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY notifications_update_own ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY notifications_delete_own ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Insert current user profile
INSERT INTO public.profiles (id, email, full_name, role, status, created_at, updated_at, last_sign_in_at)
SELECT 
    u.id,
    u.email,
    'Admin User',
    'admin',
    'active',
    NOW(),
    NOW(),
    NOW()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ORDER BY u.created_at DESC
LIMIT 1;

COMMIT;

SELECT 'Quick fix completed!' as result;
