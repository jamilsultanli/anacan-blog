import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '69580ea2002ecc4ff8e1';
const apiKey = process.env.APPWRITE_API_KEY || '';

if (!apiKey) {
  console.error('❌ APPWRITE_API_KEY is required in .env.local');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);
const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID || 'anacan';

async function createCollection(name: string, collectionId: string, attributes: any[], indexes: any[] = []) {
  let retries = 3;
  while (retries > 0) {
    try {
      await databases.getCollection(databaseId, collectionId);
      console.log(`⚠️  Collection '${name}' already exists`);
      break; // Collection exists, continue with attributes
    } catch (error: any) {
      if (error.code === 404) {
        try {
          console.log(`📋 Creating collection: ${name}...`);
          await databases.createCollection(
            databaseId,
            collectionId,
            name,
            [
              Permission.read(Role.any()),
              Permission.create(Role.users()),
              Permission.update(Role.users()),
              Permission.delete(Role.users()),
            ]
          );
          console.log(`✅ Collection '${name}' created`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait after creating collection
          break; // Success, exit retry loop
        } catch (createError: any) {
          retries--;
          if (createError.code === 'ECONNRESET' || createError.message?.includes('fetch failed')) {
            if (retries > 0) {
              console.log(`  ⚠️  Network error creating collection, retrying... (${retries} attempts left)`);
              await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
              console.error(`  ❌ Error creating collection after retries:`, createError.message);
              return; // Give up on this collection
            }
          } else {
            throw createError; // Other errors, don't retry
          }
        }
      } else if (error.code === 'ECONNRESET' || error.message?.includes('fetch failed')) {
        retries--;
        if (retries > 0) {
          console.log(`  ⚠️  Network error checking collection, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.error(`  ❌ Error checking collection after retries:`, error.message);
          return; // Give up on this collection
        }
      } else {
        throw error; // Other errors, don't retry
      }
    }
  }

  // Create attributes
  for (const attr of attributes) {
    let retries = 3;
    while (retries > 0) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.size || 255,
            attr.required || false
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.required || false,
            undefined,
            undefined,
            undefined
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.required || false,
            undefined
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.required || false
          );
        }
        console.log(`  ✅ Attribute ${attr.key} created`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        break; // Success, exit retry loop
      } catch (error: any) {
        retries--;
        if (error.code === 409) {
          console.log(`  ⚠️  Attribute ${attr.key} already exists`);
          break; // Already exists, no need to retry
        } else if (error.code === 'ECONNRESET' || error.message?.includes('fetch failed')) {
          if (retries > 0) {
            console.log(`  ⚠️  Network error for ${attr.key}, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait longer before retry
          } else {
            console.error(`  ❌ Error creating attribute ${attr.key} after retries:`, error.message);
          }
        } else {
          console.error(`  ❌ Error creating attribute ${attr.key}:`, error.message);
          break; // Other errors, don't retry
        }
      }
    }
  }

  // Create indexes
  for (const idx of indexes) {
    let retries = 3;
    while (retries > 0) {
      try {
        await databases.createIndex(
          databaseId,
          collectionId,
          idx.key,
          idx.type,
          idx.attributes
        );
        console.log(`  ✅ Index ${idx.key} created`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        break; // Success, exit retry loop
      } catch (error: any) {
        retries--;
        if (error.code === 409) {
          console.log(`  ⚠️  Index ${idx.key} already exists`);
          break; // Already exists, no need to retry
        } else if (error.code === 'ECONNRESET' || error.message?.includes('fetch failed')) {
          if (retries > 0) {
            console.log(`  ⚠️  Network error for index ${idx.key}, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait longer before retry
          } else {
            console.error(`  ❌ Error creating index ${idx.key} after retries:`, error.message);
          }
        } else {
          console.error(`  ❌ Error creating index ${idx.key}:`, error.message);
          break; // Other errors, don't retry
        }
      }
    }
  }
}

async function createCommunityCollections() {
  console.log('🚀 Creating community collections...\n');
  console.log('⚠️  Note: Network errors may occur. The script will retry automatically.\n');

  // 1. Follows Collection
  await createCollection(
    'Follows',
    'follows',
    [
      { key: 'follower_id', type: 'string', size: 36, required: true },
      { key: 'following_id', type: 'string', size: 36, required: true },
    ],
    [
      { key: 'idx_follower', type: 'key', attributes: ['follower_id'] },
      { key: 'idx_following', type: 'key', attributes: ['following_id'] },
    ]
  );

  // 2. User Activities Collection
  await createCollection(
    'User Activities',
    'user_activities',
    [
      { key: 'user_id', type: 'string', size: 36, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'target_id', type: 'string', size: 36, required: true },
      { key: 'target_type', type: 'string', size: 20, required: true },
      { key: 'metadata', type: 'string', size: 2000, required: false },
    ],
    [
      { key: 'idx_user', type: 'key', attributes: ['user_id'] },
      { key: 'idx_type', type: 'key', attributes: ['type'] },
    ]
  );

  // 3. Forums Collection
  await createCollection(
    'Forums',
    'forums',
    [
      { key: 'name_az', type: 'string', size: 255, required: true },
      { key: 'name_ru', type: 'string', size: 255, required: true },
      { key: 'slug', type: 'string', size: 255, required: true },
      { key: 'description_az', type: 'string', size: 1000, required: false },
      { key: 'description_ru', type: 'string', size: 1000, required: false },
      { key: 'icon', type: 'string', size: 50, required: false },
      { key: 'color', type: 'string', size: 50, required: false },
      { key: 'is_active', type: 'boolean', required: false },
      { key: 'order', type: 'integer', required: false },
    ],
    [
      { key: 'idx_slug', type: 'unique', attributes: ['slug'] },
    ]
  );

  // 4. Forum Posts Collection
  await createCollection(
    'Forum Posts',
    'forum_posts',
    [
      { key: 'forum_id', type: 'string', size: 36, required: true },
      { key: 'user_id', type: 'string', size: 36, required: true },
      { key: 'title', type: 'string', size: 500, required: true },
      { key: 'content', type: 'string', size: 10000, required: true },
      { key: 'is_pinned', type: 'boolean', required: false },
      { key: 'is_solved', type: 'boolean', required: false },
      { key: 'view_count', type: 'integer', required: false },
      { key: 'upvote_count', type: 'integer', required: false },
      { key: 'downvote_count', type: 'integer', required: false },
      { key: 'reply_count', type: 'integer', required: false },
      { key: 'last_reply_at', type: 'datetime', required: false },
    ],
    [
      { key: 'idx_forum', type: 'key', attributes: ['forum_id'] },
      { key: 'idx_user', type: 'key', attributes: ['user_id'] },
    ]
  );

  // 5. Reading Lists Collection
  await createCollection(
    'Reading Lists',
    'reading_lists',
    [
      { key: 'user_id', type: 'string', size: 36, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'is_public', type: 'boolean', required: false },
      { key: 'cover_image_url', type: 'string', size: 500, required: false },
      { key: 'post_count', type: 'integer', required: false },
    ],
    [
      { key: 'idx_user', type: 'key', attributes: ['user_id'] },
    ]
  );

  // 6. Reading List Items Collection
  await createCollection(
    'Reading List Items',
    'reading_list_items',
    [
      { key: 'list_id', type: 'string', size: 36, required: true },
      { key: 'post_id', type: 'string', size: 36, required: true },
      { key: 'order', type: 'integer', required: false },
    ],
    [
      { key: 'idx_list', type: 'key', attributes: ['list_id'] },
      { key: 'idx_post', type: 'key', attributes: ['post_id'] },
    ]
  );

  // 7. Forum Replies Collection
  await createCollection(
    'Forum Replies',
    'forum_replies',
    [
      { key: 'forum_post_id', type: 'string', size: 36, required: true },
      { key: 'user_id', type: 'string', size: 36, required: true },
      { key: 'content', type: 'string', size: 5000, required: true },
      { key: 'parent_reply_id', type: 'string', size: 36, required: false },
      { key: 'is_helpful', type: 'boolean', required: false },
      { key: 'upvote_count', type: 'integer', required: false },
    ],
    [
      { key: 'idx_forum_post', type: 'key', attributes: ['forum_post_id'] },
      { key: 'idx_user', type: 'key', attributes: ['user_id'] },
      { key: 'idx_parent_reply', type: 'key', attributes: ['parent_reply_id'] },
    ]
  );

  // 8. Forum Votes Collection
  await createCollection(
    'Forum Votes',
    'forum_votes',
    [
      { key: 'forum_post_id', type: 'string', size: 36, required: true },
      { key: 'user_id', type: 'string', size: 36, required: true },
      { key: 'vote_type', type: 'string', size: 20, required: true },
    ],
    [
      { key: 'idx_forum_post', type: 'key', attributes: ['forum_post_id'] },
      { key: 'idx_user', type: 'key', attributes: ['user_id'] },
    ]
  );

  console.log('\n✨ Community collections setup completed!');
}

createCommunityCollections().catch(console.error);

