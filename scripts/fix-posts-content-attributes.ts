/**
 * Fix Posts Content Attributes Script
 * 
 * This script updates content_az and content_ru attributes to support longer content.
 * Note: In Appwrite, you cannot directly update attribute size. You need to:
 * 1. Delete the old attribute
 * 2. Create a new attribute with larger size
 * 
 * WARNING: This will delete existing data in those attributes!
 * Make sure to backup your data before running this script.
 * 
 * Usage: npx tsx scripts/fix-posts-content-attributes.ts
 */

import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '69580ea2002ecc4ff8e1';
const apiKey = process.env.APPWRITE_API_KEY || '';
const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID || 'anacan';
const collectionId = 'posts';

if (!apiKey) {
  console.error('❌ APPWRITE_API_KEY is required in .env.local');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function fixContentAttributes() {
  console.log('🔧 Fixing content attributes in posts collection...\n');
  console.log('⚠️  WARNING: This will delete existing content_az and content_ru attributes!');
  console.log('⚠️  Make sure you have backed up your data!\n');
  
  try {
    // Delete old attributes
    console.log('1. Deleting old content_az attribute...');
    try {
      await databases.deleteAttribute(databaseId, collectionId, 'content_az');
      console.log('   ✅ Deleted content_az');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      if (error.code === 404) {
        console.log('   ⏭️  content_az does not exist');
      } else {
        throw error;
      }
    }

    console.log('2. Deleting old content_ru attribute...');
    try {
      await databases.deleteAttribute(databaseId, collectionId, 'content_ru');
      console.log('   ✅ Deleted content_ru');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      if (error.code === 404) {
        console.log('   ⏭️  content_ru does not exist');
      } else {
        throw error;
      }
    }

    // Wait for deletion to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create new attributes with larger size (16777216 = 16MB max)
    console.log('3. Creating new content_az attribute (size: 16777216)...');
    await databases.createStringAttribute(
      databaseId,
      collectionId,
      'content_az',
      16777216, // 16MB - maximum size
      true, // required
      undefined, // default
      false // array
    );
    console.log('   ✅ Created content_az (size: 16777216)');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('4. Creating new content_ru attribute (size: 16777216)...');
    await databases.createStringAttribute(
      databaseId,
      collectionId,
      'content_ru',
      16777216, // 16MB - maximum size
      true, // required
      undefined, // default
      false // array
    );
    console.log('   ✅ Created content_ru (size: 16777216)');

    console.log('\n✅ Content attributes fixed successfully!');
    console.log('⚠️  Note: Existing content data was deleted. You may need to re-enter content.');
  } catch (error: any) {
    console.error('\n❌ Error fixing attributes:', error.message);
    process.exit(1);
  }
}

fixContentAttributes();

