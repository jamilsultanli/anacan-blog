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

async function createNewsletterCollection() {
  console.log('🚀 Creating newsletter_subscriptions collection...\n');

  try {
    // Check if collection exists
    try {
      await databases.getCollection(databaseId, 'newsletter_subscriptions');
      console.log('⚠️  Collection already exists, checking attributes...\n');
    } catch (error: any) {
      if (error.code === 404) {
        // Collection doesn't exist, create it
        console.log('📋 Creating collection...');
        await databases.createCollection(
          databaseId,
          'newsletter_subscriptions',
          'Newsletter Subscriptions',
          [
            Permission.read(Role.any()), // Anyone can read (for checking duplicates)
            Permission.create(Role.any()), // Anyone can subscribe
            Permission.update(Role.users()), // Users can update (unsubscribe)
            Permission.delete(Role.users()), // Users can delete
          ]
        );
        console.log('✅ Collection created\n');
      } else {
        throw error;
      }
    }

    // Create attributes
    const attributes = [
      { key: 'email', type: 'email', required: true },
      { key: 'name', type: 'string', size: 255, required: false },
      { key: 'surname', type: 'string', size: 255, required: false },
      { key: 'is_active', type: 'boolean', required: false },
      { key: 'subscribed_at', type: 'datetime', required: false },
      { key: 'unsubscribed_at', type: 'datetime', required: false },
    ];

    for (const attr of attributes) {
      try {
        console.log(`📝 Creating attribute: ${attr.key}...`);
        
        if (attr.type === 'email') {
          await databases.createEmailAttribute(
            databaseId,
            'newsletter_subscriptions',
            attr.key,
            attr.required || false
          );
        } else if (attr.type === 'string') {
          await databases.createStringAttribute(
            databaseId,
            'newsletter_subscriptions',
            attr.key,
            (attr as any).size || 255,
            attr.required || false
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            databaseId,
            'newsletter_subscriptions',
            attr.key,
            attr.required || false,
            undefined // no default value
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            databaseId,
            'newsletter_subscriptions',
            attr.key,
            attr.required || false
          );
        }
        
        console.log(`✅ Attribute ${attr.key} created`);
        // Wait a bit for attribute to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`⚠️  Attribute ${attr.key} already exists`);
        } else {
          console.error(`❌ Error creating attribute ${attr.key}:`, error.message);
        }
      }
    }

    // Create index for email
    try {
      console.log('\n📊 Creating index for email...');
      await databases.createIndex(
        databaseId,
        'newsletter_subscriptions',
        'idx_email',
        'key',
        ['email']
      );
      console.log('✅ Index created');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Index already exists');
      } else {
        console.error('❌ Error creating index:', error.message);
      }
    }

    console.log('\n✨ Newsletter collection setup completed!');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

createNewsletterCollection();

