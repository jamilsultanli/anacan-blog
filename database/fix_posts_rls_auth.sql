-- Fix RLS policies for posts to ensure they work correctly for both authenticated and anonymous users
-- Problem: After login and refresh, queries return 0 results due to RLS policy conflicts

-- First, let's check if there's a conflict with multiple SELECT policies
-- Supabase uses OR logic - if ANY policy matches, the user can see the row
-- So having both "Published posts are viewable by everyone" and "Users can view their own posts" should work

-- However, the issue might be that the policies need to be more explicit
-- Let's recreate them with better logic

-- Drop existing policies
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Users can view their own posts" ON posts;

-- Recreate with explicit logic that works for both authenticated and anonymous users
-- This policy allows ANYONE (authenticated or not) to see published posts
CREATE POLICY "Published posts are viewable by everyone" 
  ON posts FOR SELECT 
  USING (status = 'published');

-- This policy allows authenticated users to see their own posts (even if not published)
CREATE POLICY "Users can view their own posts" 
  ON posts FOR SELECT 
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = author_id
  );

-- Verify the policies work correctly
-- Note: Supabase evaluates policies with OR logic, so:
-- - Anonymous users: Can see published posts (from first policy)
-- - Authenticated users: Can see published posts (from first policy) OR their own posts (from second policy)

