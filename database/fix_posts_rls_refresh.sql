-- Fix RLS policies for posts to ensure authenticated users can see published posts
-- This ensures that the "Published posts are viewable by everyone" policy works
-- correctly even when users are authenticated

-- Drop and recreate the policy to ensure it works for both authenticated and anonymous users
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON posts;

-- Recreate with explicit check for published status (works for all users)
CREATE POLICY "Published posts are viewable by everyone" 
  ON posts FOR SELECT 
  USING (status = 'published');

-- Ensure the policy allows both authenticated and anonymous users
-- The policy above should work for everyone, but let's make sure there are no conflicts

-- Also ensure users can still see their own posts (even if not published)
-- This policy is already there, but let's verify it doesn't conflict
DROP POLICY IF EXISTS "Users can view their own posts" ON posts;
CREATE POLICY "Users can view their own posts" 
  ON posts FOR SELECT 
  USING (auth.uid() = author_id);

-- Note: With OR logic, if either policy matches, the user can see the post
-- So authenticated users can see:
-- 1. All published posts (from first policy)
-- 2. Their own posts (from second policy)
-- Anonymous users can see:
-- 1. All published posts (from first policy)

