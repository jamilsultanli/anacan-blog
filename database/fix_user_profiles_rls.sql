-- Fix RLS policy for user_profiles to allow profile creation during signup
-- This migration fixes the "new row violates row-level security policy" error

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Create a new policy that allows users to insert their own profile
-- This works because after signUp, Supabase automatically signs the user in
CREATE POLICY "Users can insert their own profile" ON user_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Alternative: Create a database function that can be called with service role
-- This is more reliable if session isn't immediately available
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NULL),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that automatically creates profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

