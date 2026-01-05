# Appwrite Migration Guide

## Step 1: Create Appwrite Cloud Account

1. Go to https://cloud.appwrite.io
2. Sign up for a free account
3. Create a new project
4. Note your Project ID

## Step 2: Get Your Credentials

From Appwrite Console:
- **Endpoint**: `https://cloud.appwrite.io/v1` (default)
- **Project ID**: Found in your project settings

## Step 3: Configure Environment Variables

Add to `.env.local`:

```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=anacan
```

## Step 4: Create Database and Collections

### Create Database
1. Go to Databases in Appwrite Console
2. Create database with ID: `anacan`

### Create Collections

You need to create these collections with their attributes and permissions:

#### 1. categories
Attributes:
- slug (string, required, unique)
- name_az (string, required)
- name_ru (string, required)
- icon (string)
- color (string)
- created_at (datetime)
- updated_at (datetime)

Permissions:
- Read: Any (public)
- Create/Update/Delete: Users with admin role

#### 2. posts
Attributes:
- slug (string, required, unique)
- title_az (string, required)
- title_ru (string, required)
- excerpt_az (string)
- excerpt_ru (string)
- content_az (string, required)
- content_ru (string, required)
- category_id (string)
- author_id (string, required)
- author_name (string)
- published_at (datetime)
- image_url (string)
- read_time (integer, default: 5)
- is_featured (boolean, default: false)
- status (enum: draft, published, archived, default: draft)
- view_count (integer, default: 0)
- created_at (datetime)
- updated_at (datetime)

Permissions:
- Read: Any (for published posts), Users (for own drafts)
- Create/Update/Delete: Users (for own posts), Admins (for all)

#### 3. user_profiles
Attributes:
- username (string, unique)
- full_name (string)
- avatar_url (string)
- bio (string)
- role (enum: user, author, admin, default: user)
- email (string, required)
- created_at (datetime)
- updated_at (datetime)

Permissions:
- Read: Any (public fields), Users (own profile)
- Create/Update: Users (own profile), Admins (all)
- Delete: Admins only

#### 4. comments
Attributes:
- post_id (string, required)
- user_id (string, required)
- parent_id (string)
- content (string, required)
- is_approved (boolean, default: true)
- created_at (datetime)
- updated_at (datetime)

Permissions:
- Read: Any (approved comments)
- Create: Users (authenticated)
- Update/Delete: Users (own comments), Admins (all)

#### 5. tags
Attributes:
- slug (string, required, unique)
- name_az (string, required)
- name_ru (string, required)
- created_at (datetime)

#### 6. post_tags
Attributes:
- post_id (string, required)
- tag_id (string, required)

#### 7. comment_reactions
Attributes:
- comment_id (string, required)
- user_id (string, required)
- reaction_type (enum: like, helpful)

#### 8. post_likes
Attributes:
- post_id (string, required)
- user_id (string, required)

#### 9. bookmarks
Attributes:
- post_id (string, required)
- user_id (string, required)

#### 10. newsletter_subscriptions
Attributes:
- email (string, required, unique)
- is_active (boolean, default: true)
- subscribed_at (datetime)
- unsubscribed_at (datetime)

#### 11. reading_history
Attributes:
- user_id (string, required)
- post_id (string, required)
- read_at (datetime)

#### 12. ad_spaces, ads, translations, site_settings
(Similar structure to Supabase schema)

## Step 5: Configure Authentication

1. Go to Authentication > Settings
2. Enable Email/Password authentication
3. Configure allowed domains if needed

## Step 6: Configure Storage

1. Go to Storage
2. Create bucket: `anacan-uploads`
3. Set permissions: Users can read, authenticated users can write

## Notes

- Appwrite uses document IDs instead of UUIDs
- Relationships are handled via string references
- Permissions are set per collection
- Real-time subscriptions work differently than Supabase

