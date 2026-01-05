# Appwrite Setup Guide

## Step 1: Get Admin API Key

1. Go to [Appwrite Console](https://cloud.appwrite.io/console/project-69580ea2002ecc4ff8e1/settings/api-keys)
2. Click "Create API Key"
3. Set scope to "Databases" → "Read" and "Write"
4. Copy the API key

## Step 2: Configure Environment Variables

Add to `.env.local`:

```env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=69580ea2002ecc4ff8e1
VITE_APPWRITE_DATABASE_ID=anacan
APPWRITE_API_KEY=your-admin-api-key-here
```

## Step 3: Run Migration Script

```bash
npm run migrate:appwrite
```

This script will:
- ✅ Create the database if it doesn't exist
- ✅ Create all collections (tables)
- ✅ Create all attributes (columns)
- ✅ Create all indexes
- ✅ Set up permissions

## Collections Created

The migration script creates the following collections:

1. **categories** - Blog categories
2. **tags** - Content tags
3. **posts** - Blog posts
4. **user_profiles** - User profile information
5. **comments** - Post comments (with nested support)
6. **comment_reactions** - Comment likes/reactions
7. **post_likes** - Post likes
8. **bookmarks** - User bookmarks
9. **post_tags** - Post-tag junction table
10. **newsletter_subscriptions** - Newsletter subscriptions
11. **reading_history** - User reading history
12. **ad_spaces** - Ad placement locations
13. **ads** - Advertisement content
14. **translations** - Multilingual translations
15. **site_settings** - Site configuration

## Permissions

Collections use Appwrite's permission system:
- `read("any")` - Public read access
- `read("users")` - Authenticated users only
- `create("users")` - Authenticated users can create
- `update("users")` - Authenticated users can update
- `delete("users")` - Authenticated users can delete

## Manual Setup (Alternative)

If you prefer to set up collections manually through the Appwrite Console:

1. Go to Databases → Create Database (ID: `anacan`)
2. For each collection:
   - Create Collection with the collectionId from the script
   - Add attributes (columns)
   - Create indexes
   - Configure permissions

See `scripts/appwrite-migration.ts` for exact attribute and index definitions.

## Troubleshooting

### "API Key not found"
- Make sure `APPWRITE_API_KEY` is set in `.env.local`
- Ensure the API key has Database read/write permissions

### "Collection already exists"
- This is normal if you're re-running the script
- The script will skip existing collections

### "Attribute creation failed"
- Some attributes may already exist
- The script will continue with other attributes

## Next Steps

After migration:
1. ✅ Collections are created
2. ⏭️ Configure Storage bucket (ID: `anacan-uploads`)
3. ⏭️ Test authentication
4. ⏭️ Test data operations

