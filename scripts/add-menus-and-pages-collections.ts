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

async function createCollections() {
  console.log('🚀 Creating menus and pages collections...\n');

  try {
    // 1. Menus Collection
    console.log('📋 Creating menus collection...');
    try {
      await databases.createCollection(databaseId, 'menus', 'Menus', [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]);
      console.log('✅ Menus collection created');
    } catch (e: any) {
      if (e.code === 409) {
        console.log('⚠️  Menus collection already exists');
      } else {
        throw e;
      }
    }

    // Menu attributes
    const menuAttributes = [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'location', type: 'string', size: 50, required: true }, // 'header', 'footer'
      { key: 'items', type: 'string', size: 16777216, required: false }, // JSON array
      { key: 'order', type: 'integer', required: false },
    ];

    for (const attr of menuAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            databaseId,
            'menus',
            attr.key,
            attr.size,
            attr.required,
            undefined,
            false
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            databaseId,
            'menus',
            attr.key,
            attr.required,
            undefined, // default value
            undefined, // min
            undefined  // max
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

    // 2. Pages Collection
    console.log('\n📄 Creating pages collection...');
    try {
      await databases.createCollection(databaseId, 'pages', 'Pages', [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]);
      console.log('✅ Pages collection created');
    } catch (e: any) {
      if (e.code === 409) {
        console.log('⚠️  Pages collection already exists');
      } else {
        throw e;
      }
    }

    // Page attributes
    const pageAttributes = [
      { key: 'slug', type: 'string', size: 255, required: true },
      { key: 'title_az', type: 'string', size: 500, required: true },
      { key: 'title_ru', type: 'string', size: 500, required: true },
      { key: 'content_az', type: 'string', size: 16777216, required: true },
      { key: 'content_ru', type: 'string', size: 16777216, required: true },
      { key: 'meta_title_az', type: 'string', size: 500, required: false },
      { key: 'meta_title_ru', type: 'string', size: 500, required: false },
      { key: 'meta_description_az', type: 'string', size: 500, required: false },
      { key: 'meta_description_ru', type: 'string', size: 500, required: false },
      { key: 'is_published', type: 'boolean', required: false },
      { key: 'order', type: 'integer', required: false },
    ];

    for (const attr of pageAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            databaseId,
            'pages',
            attr.key,
            attr.size,
            attr.required,
            undefined,
            false
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            databaseId,
            'pages',
            attr.key,
            attr.required,
            undefined, // default value
            undefined, // min
            undefined  // max
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            databaseId,
            'pages',
            attr.key,
            attr.required,
            undefined // No default value for required attributes
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
      await databases.createIndex(databaseId, 'menus', 'idx_location', 'key', ['location']);
      console.log('  ✅ Index on menus.location created');
    } catch (e: any) {
      if (e.code !== 409) console.log('  ⚠️  Index on menus.location already exists or error');
    }

    try {
      await databases.createIndex(databaseId, 'pages', 'idx_slug', 'unique', ['slug']);
      console.log('  ✅ Index on pages.slug created');
    } catch (e: any) {
      if (e.code !== 409) console.log('  ⚠️  Index on pages.slug already exists or error');
    }

    console.log('\n✨ Collections created successfully!');
  } catch (error: any) {
    console.error('\n❌ Error creating collections:', error.message);
    process.exit(1);
  }
}

createCollections();

