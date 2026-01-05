import { Client, Databases } from 'node-appwrite';
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

async function addIsClosedAttribute() {
  console.log('🚀 Adding is_closed attribute to forum_posts collection...\n');

  try {
    // Check if attribute already exists
    try {
      const collection = await databases.getCollection(databaseId, 'forum_posts');
      const attributes = await databases.listAttributes(databaseId, 'forum_posts');
      
      const hasIsClosed = attributes.attributes.some((attr: any) => attr.key === 'is_closed');
      if (hasIsClosed) {
        console.log('✅ Attribute "is_closed" already exists in forum_posts collection');
        return;
      }
    } catch (error: any) {
      if (error.code !== 404) {
        throw error;
      }
    }

    // Create is_closed boolean attribute
    console.log('📝 Creating is_closed attribute...');
    await databases.createBooleanAttribute(
      databaseId,
      'forum_posts',
      'is_closed',
      false, // not required
      false  // default value
    );

    console.log('✅ Successfully added is_closed attribute to forum_posts collection');
    console.log('\n✨ Done!');
  } catch (error: any) {
    if (error.code === 409) {
      console.log('⚠️  Attribute "is_closed" already exists');
    } else {
      console.error('\n❌ Error adding attribute:', error.message);
      process.exit(1);
    }
  }
}

addIsClosedAttribute().catch(console.error);

