/**
 * Appwrite Migration Script
 * 
 * This script creates all collections (tables) in Appwrite based on Supabase schema.
 * 
 * Usage:
 * 1. Set your Appwrite credentials in .env.local:
 *    APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
 *    APPWRITE_PROJECT_ID=69580ea2002ecc4ff8e1
 *    APPWRITE_API_KEY=your-admin-api-key-here
 *    APPWRITE_DATABASE_ID=anacan
 * 
 * 2. Run: npx tsx scripts/appwrite-migration.ts
 */

import { Client, Databases, ID, Query } from 'node-appwrite';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '69580ea2002ecc4ff8e1';
const apiKey = process.env.APPWRITE_API_KEY || '';
const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID || 'anacan';

if (!apiKey) {
  console.error('❌ APPWRITE_API_KEY is required in .env.local');
  console.log('Get your API key from: https://cloud.appwrite.io/console/project-' + projectId + '/settings/api-keys');
  process.exit(1);
}

// Initialize Appwrite client with admin API key (using node-appwrite for server-side)
const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey); // Admin API key for server-side operations

const databases = new Databases(client);

interface CollectionDefinition {
  collectionId: string;
  name: string;
  permissions: string[];
  attributes: Array<{
    key: string;
    type: 'string' | 'integer' | 'boolean' | 'double' | 'datetime' | 'email';
    size?: number;
    required: boolean;
    array?: boolean;
    default?: any;
  }>;
  indexes: Array<{
    key: string;
    type: 'key' | 'fulltext';
    attributes: string[];
    orders?: string[];
  }>;
}

const collections: CollectionDefinition[] = [
  // Categories
  {
    collectionId: 'categories',
    name: 'Categories',
    permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
    attributes: [
      { key: 'slug', type: 'string', size: 255, required: true },
      { key: 'name_az', type: 'string', size: 255, required: true },
      { key: 'name_ru', type: 'string', size: 255, required: true },
      { key: 'icon', type: 'string', size: 50, required: false },
      { key: 'color', type: 'string', size: 100, required: false },
    ],
    indexes: [
      { key: 'idx_slug', type: 'key', attributes: ['slug'] },
    ],
  },
  
  // Tags
  {
    collectionId: 'tags',
    name: 'Tags',
    permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
    attributes: [
      { key: 'slug', type: 'string', size: 255, required: true },
      { key: 'name_az', type: 'string', size: 255, required: true },
      { key: 'name_ru', type: 'string', size: 255, required: true },
    ],
    indexes: [
      { key: 'idx_slug', type: 'key', attributes: ['slug'] },
    ],
  },
  
  // Posts
  {
    collectionId: 'posts',
    name: 'Posts',
    permissions: [
      'read("any")', // Published posts visible to everyone
      'create("users")',
      'update("users")',
      'delete("users")',
    ],
    attributes: [
      { key: 'slug', type: 'string', size: 255, required: true },
      { key: 'title_az', type: 'string', required: true },
      { key: 'title_ru', type: 'string', required: true },
      { key: 'excerpt_az', type: 'string', required: false },
      { key: 'excerpt_ru', type: 'string', required: false },
      { key: 'content_az', type: 'string', required: true },
      { key: 'content_ru', type: 'string', required: true },
      { key: 'category_id', type: 'string', size: 36, required: false },
      { key: 'author_id', type: 'string', size: 36, required: true },
      { key: 'author_name', type: 'string', size: 255, required: false },
      { key: 'published_at', type: 'datetime', required: false },
      { key: 'image_url', type: 'string', required: false },
      { key: 'read_time', type: 'integer', required: false, default: 5 },
      { key: 'is_featured', type: 'boolean', required: false, default: false },
      { key: 'status', type: 'string', size: 20, required: false, default: 'draft' },
      { key: 'view_count', type: 'integer', required: false, default: 0 },
    ],
    indexes: [
      { key: 'idx_slug', type: 'key', attributes: ['slug'] },
      { key: 'idx_category', type: 'key', attributes: ['category_id'] },
      { key: 'idx_status', type: 'key', attributes: ['status'] },
      { key: 'idx_published', type: 'key', attributes: ['published_at'] },
      { key: 'idx_featured', type: 'key', attributes: ['is_featured'] },
      { key: 'idx_author', type: 'key', attributes: ['author_id'] },
    ],
  },
  
  // User Profiles
  {
    collectionId: 'user_profiles',
    name: 'User Profiles',
    permissions: [
      'read("any")', // Public read
      'create("users")',
      'update("users")', // Users can update own profile
      'delete("users")',
    ],
    attributes: [
      { key: 'username', type: 'string', size: 100, required: false },
      { key: 'full_name', type: 'string', size: 255, required: false },
      { key: 'avatar_url', type: 'string', required: false },
      { key: 'bio', type: 'string', required: false },
      { key: 'role', type: 'string', size: 20, required: false, default: 'user' },
      { key: 'email', type: 'email', required: false },
    ],
    indexes: [
      { key: 'idx_username', type: 'key', attributes: ['username'] },
      { key: 'idx_role', type: 'key', attributes: ['role'] },
    ],
  },
  
  // Comments
  {
    collectionId: 'comments',
    name: 'Comments',
    permissions: [
      'read("any")', // Approved comments visible to everyone
      'create("users")',
      'update("users")', // Users can update own comments
      'delete("users")',
    ],
    attributes: [
      { key: 'post_id', type: 'string', size: 36, required: true },
      { key: 'user_id', type: 'string', size: 36, required: true },
      { key: 'parent_id', type: 'string', size: 36, required: false },
      { key: 'content', type: 'string', required: true },
      { key: 'is_approved', type: 'boolean', required: false, default: true },
    ],
    indexes: [
      { key: 'idx_post', type: 'key', attributes: ['post_id'] },
      { key: 'idx_parent', type: 'key', attributes: ['parent_id'] },
      { key: 'idx_user', type: 'key', attributes: ['user_id'] },
    ],
  },
  
  // Comment Reactions
  {
    collectionId: 'comment_reactions',
    name: 'Comment Reactions',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")',
    ],
    attributes: [
      { key: 'comment_id', type: 'string', size: 36, required: true },
      { key: 'user_id', type: 'string', size: 36, required: true },
      { key: 'reaction_type', type: 'string', size: 20, required: true },
    ],
    indexes: [
      { key: 'idx_comment', type: 'key', attributes: ['comment_id'] },
      { key: 'idx_user', type: 'key', attributes: ['user_id'] },
    ],
  },
  
  // Post Likes
  {
    collectionId: 'post_likes',
    name: 'Post Likes',
    permissions: [
      'read("any")',
      'create("users")',
      'delete("users")',
    ],
    attributes: [
      { key: 'post_id', type: 'string', size: 36, required: true },
      { key: 'user_id', type: 'string', size: 36, required: true },
    ],
    indexes: [
      { key: 'idx_post', type: 'key', attributes: ['post_id'] },
      { key: 'idx_user', type: 'key', attributes: ['user_id'] },
    ],
  },
  
  // Bookmarks
  {
    collectionId: 'bookmarks',
    name: 'Bookmarks',
    permissions: [
      'read("users")', // Users can read own bookmarks
      'create("users")',
      'delete("users")',
    ],
    attributes: [
      { key: 'post_id', type: 'string', size: 36, required: true },
      { key: 'user_id', type: 'string', size: 36, required: true },
    ],
    indexes: [
      { key: 'idx_post', type: 'key', attributes: ['post_id'] },
      { key: 'idx_user', type: 'key', attributes: ['user_id'] },
    ],
  },
  
  // Post Tags (junction table)
  {
    collectionId: 'post_tags',
    name: 'Post Tags',
    permissions: [
      'read("any")',
      'create("users")',
      'delete("users")',
    ],
    attributes: [
      { key: 'post_id', type: 'string', size: 36, required: true },
      { key: 'tag_id', type: 'string', size: 36, required: true },
    ],
    indexes: [
      { key: 'idx_post', type: 'key', attributes: ['post_id'] },
      { key: 'idx_tag', type: 'key', attributes: ['tag_id'] },
    ],
  },
  
  // Newsletter Subscriptions
  {
    collectionId: 'newsletter_subscriptions',
    name: 'Newsletter Subscriptions',
    permissions: [
      'read("users")',
      'create("any")', // Anyone can subscribe
      'update("users")',
      'delete("users")',
    ],
    attributes: [
      { key: 'email', type: 'email', required: true },
      { key: 'is_active', type: 'boolean', required: false, default: true },
      { key: 'subscribed_at', type: 'datetime', required: false },
      { key: 'unsubscribed_at', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'idx_email', type: 'key', attributes: ['email'] },
    ],
  },
  
  // Reading History
  {
    collectionId: 'reading_history',
    name: 'Reading History',
    permissions: [
      'read("users")', // Users can read own history
      'create("users")',
      'update("users")',
      'delete("users")',
    ],
    attributes: [
      { key: 'user_id', type: 'string', size: 36, required: true },
      { key: 'post_id', type: 'string', size: 36, required: true },
      { key: 'read_at', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'idx_user', type: 'key', attributes: ['user_id'] },
      { key: 'idx_post', type: 'key', attributes: ['post_id'] },
    ],
  },
  
  // Ad Spaces
  {
    collectionId: 'ad_spaces',
    name: 'Ad Spaces',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")',
    ],
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'slug', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', required: false },
      { key: 'position', type: 'string', size: 50, required: true },
      { key: 'width', type: 'integer', required: false },
      { key: 'height', type: 'integer', required: false },
      { key: 'is_active', type: 'boolean', required: false, default: true },
    ],
    indexes: [
      { key: 'idx_slug', type: 'key', attributes: ['slug'] },
      { key: 'idx_position', type: 'key', attributes: ['position'] },
    ],
  },
  
  // Ads
  {
    collectionId: 'ads',
    name: 'Ads',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")',
    ],
    attributes: [
      { key: 'ad_space_id', type: 'string', size: 36, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'content', type: 'string', required: false },
      { key: 'image_url', type: 'string', required: false },
      { key: 'video_url', type: 'string', required: false },
      { key: 'link_url', type: 'string', required: false },
      { key: 'start_date', type: 'datetime', required: false },
      { key: 'end_date', type: 'datetime', required: false },
      { key: 'is_active', type: 'boolean', required: false, default: true },
      { key: 'click_count', type: 'integer', required: false, default: 0 },
      { key: 'impression_count', type: 'integer', required: false, default: 0 },
    ],
    indexes: [
      { key: 'idx_ad_space', type: 'key', attributes: ['ad_space_id'] },
      { key: 'idx_is_active', type: 'key', attributes: ['is_active'] },
    ],
  },
  
  // Translations
  {
    collectionId: 'translations',
    name: 'Translations',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")',
    ],
    attributes: [
      { key: 'key', type: 'string', size: 255, required: true },
      { key: 'namespace', type: 'string', size: 100, required: true },
      { key: 'value_az', type: 'string', required: true },
      { key: 'value_ru', type: 'string', required: true },
      { key: 'description', type: 'string', required: false },
    ],
    indexes: [
      { key: 'idx_key_namespace', type: 'key', attributes: ['key', 'namespace'] },
      { key: 'idx_namespace', type: 'key', attributes: ['namespace'] },
    ],
  },
  
  // Site Settings
  {
    collectionId: 'site_settings',
    name: 'Site Settings',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")',
    ],
    attributes: [
      { key: 'key', type: 'string', size: 255, required: true },
      { key: 'value_az', type: 'string', required: false },
      { key: 'value_ru', type: 'string', required: false },
      { key: 'value_json', type: 'string', required: false },
      { key: 'setting_type', type: 'string', size: 50, required: true },
    ],
    indexes: [
      { key: 'idx_key', type: 'key', attributes: ['key'] },
    ],
  },
];

async function createDatabaseIfNotExists(): Promise<void> {
  try {
    await databases.get(databaseId);
    console.log(`✅ Database "${databaseId}" already exists`);
  } catch (error: any) {
    if (error.code === 404) {
      try {
        await databases.create(databaseId, databaseId);
        console.log(`✅ Created database "${databaseId}"`);
      } catch (createError) {
        console.error(`❌ Failed to create database:`, createError);
        throw createError;
      }
    } else {
      throw error;
    }
  }
}

async function createCollection(definition: CollectionDefinition): Promise<void> {
  try {
    // Check if collection exists
    try {
      await databases.getCollection(databaseId, definition.collectionId);
      console.log(`  ⏭️  Collection "${definition.collectionId}" already exists, skipping...`);
      return;
    } catch (error: any) {
      if (error.code !== 404) throw error;
    }

    // Create collection
    await databases.createCollection(
      databaseId,
      definition.collectionId,
      definition.name,
      definition.permissions
    );
    console.log(`  ✅ Created collection "${definition.collectionId}"`);

    // Wait a bit for collection to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create attributes
    for (const attr of definition.attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            databaseId,
            definition.collectionId,
            attr.key,
            attr.size || 255,
            attr.required,
            attr.default,
            attr.array
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            databaseId,
            definition.collectionId,
            attr.key,
            attr.required,
            attr.default,
            attr.array
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            databaseId,
            definition.collectionId,
            attr.key,
            attr.required,
            attr.default,
            attr.array
          );
        } else if (attr.type === 'double') {
          await databases.createFloatAttribute(
            databaseId,
            definition.collectionId,
            attr.key,
            attr.required,
            attr.default,
            attr.array
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            databaseId,
            definition.collectionId,
            attr.key,
            attr.required,
            attr.default,
            attr.array
          );
        } else if (attr.type === 'email') {
          await databases.createEmailAttribute(
            databaseId,
            definition.collectionId,
            attr.key,
            attr.required,
            attr.default,
            attr.array
          );
        }
        
        console.log(`    ✅ Created attribute "${attr.key}" (${attr.type})`);
        
        // Wait a bit between attributes
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (attrError: any) {
        if (attrError.code === 409) {
          console.log(`    ⏭️  Attribute "${attr.key}" already exists`);
        } else {
          console.error(`    ❌ Failed to create attribute "${attr.key}":`, attrError.message);
        }
      }
    }

    // Wait for attributes to be ready before creating indexes
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create indexes
    for (const index of definition.indexes) {
      try {
        await databases.createIndex(
          databaseId,
          definition.collectionId,
          index.key,
          index.type,
          index.attributes,
          index.orders
        );
        console.log(`    ✅ Created index "${index.key}"`);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (indexError: any) {
        if (indexError.code === 409) {
          console.log(`    ⏭️  Index "${index.key}" already exists`);
        } else {
          console.error(`    ❌ Failed to create index "${index.key}":`, indexError.message);
        }
      }
    }
  } catch (error: any) {
    console.error(`  ❌ Failed to create collection "${definition.collectionId}":`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Appwrite migration...\n');
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Project ID: ${projectId}`);
  console.log(`Database ID: ${databaseId}\n`);

  try {
    // Create database if it doesn't exist
    await createDatabaseIfNotExists();
    console.log('');

    // Create all collections
    for (const collection of collections) {
      console.log(`📦 Creating collection: ${collection.collectionId}`);
      await createCollection(collection);
      console.log('');
    }

    console.log('✅ Migration completed successfully!');
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();

