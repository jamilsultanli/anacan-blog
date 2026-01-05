-- Final fix for RLS policies - ensure published posts are visible to all users
-- Problem: Authenticated users cannot see published posts after refresh
-- Solution: Ensure RLS policies work correctly for both authenticated and anonymous users

-- The issue is that Supabase RLS policies use OR logic - if ANY policy matches, access is granted
-- But sometimes policy evaluation can fail if conditions aren't explicit enough

-- Drop and recreate the SELECT policies to ensure they work correctly
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Users can view their own posts" ON posts;

-- Policy 1: Allow EVERYONE (authenticated AND anonymous) to see published posts
-- This MUST work for both authenticated and anonymous users
CREATE POLICY "Published posts are viewable by everyone" 
  ON posts 
  FOR SELECT 
  USING (status = 'published');

-- Policy 2: Allow authenticated users to see their own posts (even if not published)
-- This only applies when user is authenticated (auth.uid() IS NOT NULL)
CREATE POLICY "Users can view their own posts" 
  ON posts 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = author_id
  );

-- Test query to verify policies work:
-- As anonymous: SELECT * FROM posts WHERE status = 'published';  -- Should work (Policy 1)
-- As authenticated: SELECT * FROM posts WHERE status = 'published';  -- Should work (Policy 1)
-- As authenticated: SELECT * FROM posts WHERE author_id = auth.uid();  -- Should work (Policy 2)

