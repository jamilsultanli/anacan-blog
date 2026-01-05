# Appwrite Migration - Quick Start

## Prerequisites

1. **Appwrite Cloud Account**
   - Sign up at https://cloud.appwrite.io
   - Create a project (or use existing project ID: `69580ea2002ecc4ff8e1`)

2. **Admin API Key**
   - Go to: https://cloud.appwrite.io/console/project-69580ea2002ecc4ff8e1/settings/api-keys
   - Click "Create API Key"
   - Set scope: "Databases" → "Read" and "Write"
   - Copy the API key

## Step 1: Configure Environment

Create or update `.env.local`:

```env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=69580ea2002ecc4ff8e1
VITE_APPWRITE_DATABASE_ID=anacan

# For migration script only
APPWRITE_API_KEY=your-admin-api-key-here
```

## Step 2: Run Migration Script

```bash
npm run migrate:appwrite
```

This will:
- ✅ Create database `anacan` if it doesn't exist
- ✅ Create 15 collections (tables)
- ✅ Create all attributes (columns)
- ✅ Create indexes for performance
- ✅ Set up permissions

## Collections Created

1. `categories` - Blog categories
2. `tags` - Content tags
3. `posts` - Blog posts
4. `user_profiles` - User profiles
5. `comments` - Post comments
6. `comment_reactions` - Comment reactions
7. `post_likes` - Post likes
8. `bookmarks` - User bookmarks
9. `post_tags` - Post-tag relationships
10. `newsletter_subscriptions` - Newsletter subscriptions
11. `reading_history` - Reading history
12. `ad_spaces` - Ad placement spaces
13. `ads` - Advertisement content
14. `translations` - Multilingual strings
15. `site_settings` - Site configuration

## Troubleshooting

### "API Key not found"
Make sure `APPWRITE_API_KEY` is set in `.env.local`

### "Collection already exists"
This is normal if re-running. The script will skip existing collections.

### Attribute creation errors
Some attributes may already exist. The script will continue with others.

## Next Steps

After migration:
1. Configure Storage bucket (ID: `anacan-uploads`) in Appwrite Console
2. Test authentication flow
3. Test data operations

## Manual Setup

If you prefer manual setup, see `APPWRITE_SETUP.md` for detailed instructions.

