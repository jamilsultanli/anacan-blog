import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '69580ea2002ecc4ff8e1';
const apiKey = process.env.APPWRITE_API_KEY || '';
const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID || 'anacan';

if (!apiKey) {
  console.error('❌ APPWRITE_API_KEY is required in .env.local');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function createStoriesCollection() {
  console.log('🚀 Creating stories collection...\n');

  try {
    // Create Stories Collection
    console.log('📸 Creating stories collection...');
    try {
      await databases.createCollection(databaseId, 'stories', 'Stories', [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]);
      console.log('✅ Stories collection created');
    } catch (e: any) {
      if (e.code === 409) {
        console.log('⚠️  Stories collection already exists');
      } else {
        throw e;
      }
    }

    // Story attributes
    const storyAttributes = [
      { key: 'title_az', type: 'string', size: 500, required: false },
      { key: 'title_ru', type: 'string', size: 500, required: false },
      { key: 'image_url', type: 'string', size: 2048, required: true },
      { key: 'link_url', type: 'string', size: 2048, required: false },
      { key: 'link_text_az', type: 'string', size: 255, required: false },
      { key: 'link_text_ru', type: 'string', size: 255, required: false },
      { key: 'is_active', type: 'boolean', required: false },
      { key: 'order', type: 'integer', required: false },
      { key: 'expires_at', type: 'datetime', required: false },
    ];

    for (const attr of storyAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            databaseId,
            'stories',
            attr.key,
            attr.size,
            attr.required,
            undefined,
            false
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            databaseId,
            'stories',
            attr.key,
            attr.required,
            undefined, // min
            undefined, // max
            undefined, // default
            false      // array
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            databaseId,
            'stories',
            attr.key,
            attr.required,
            undefined // default (don't set default for required boolean)
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            databaseId,
            'stories',
            attr.key,
            attr.required
          );
        }
        console.log(`  ✅ Attribute '${attr.key}' created`);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e: any) {
        if (e.code === 409) {
          console.log(`  ⚠️  Attribute '${attr.key}' already exists`);
        } else {
          console.error(`  ❌ Error creating attribute '${attr.key}':`, e.message);
        }
      }
    }

    // Create indexes
    console.log('\n📇 Creating indexes...');
    try {
      await databases.createIndex(databaseId, 'stories', 'idx_active', 'key', ['is_active']);
      console.log('  ✅ Index on stories.is_active created');
    } catch (e: any) {
      if (e.code !== 409) console.log('  ⚠️  Index on stories.is_active already exists or error');
    }

    try {
      await databases.createIndex(databaseId, 'stories', 'idx_order', 'key', ['order']);
      console.log('  ✅ Index on stories.order created');
    } catch (e: any) {
      if (e.code !== 409) console.log('  ⚠️  Index on stories.order already exists or error');
    }

    console.log('\n✨ Stories collection created successfully!');
  } catch (error: any) {
    console.error('\n❌ Error creating stories collection:', error.message);
    process.exit(1);
  }
}

createStoriesCollection();

