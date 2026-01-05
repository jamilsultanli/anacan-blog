import { Client, Databases, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config({ path: '.env.local' });

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '69580ea2002ecc4ff8e1';
const apiKey = process.env.APPWRITE_API_KEY || '';

if (!apiKey) {
  console.error('❌ APPWRITE_API_KEY is required in .env.local');
  process.exit(1);
}

const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID || 'anacan';
const collectionId = 'categories';

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

const DUMMY_CATEGORIES = [
  {
    slug: 'hamilelik',
    name_az: 'Hamiləlik',
    name_ru: 'Беременность',
    icon: '🤰',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    slug: 'korpe',
    name_az: 'Körpə',
    name_ru: 'Малыш',
    icon: '👶',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    slug: 'terbiye',
    name_az: 'Tərbiyə',
    name_ru: 'Воспитание',
    icon: '👨‍👩‍👧',
    color: 'bg-green-100 text-green-600',
  },
  {
    slug: 'saglamliq',
    name_az: 'Sağlamlıq',
    name_ru: 'Здоровье',
    icon: '🩺',
    color: 'bg-red-100 text-red-600',
  },
  {
    slug: 'ozune-qulluq',
    name_az: 'Özünə Qulluq',
    name_ru: 'Уход за собой',
    icon: '🧘‍♀️',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    slug: 'qidalanma',
    name_az: 'Qidalanma',
    name_ru: 'Питание',
    icon: '🍎',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    slug: 'xidmetler',
    name_az: 'Xidmətlər',
    name_ru: 'Услуги',
    icon: '🎁',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    slug: 'oyuncaglar',
    name_az: 'Oyuncaqlar',
    name_ru: 'Игрушки',
    icon: '🧸',
    color: 'bg-indigo-100 text-indigo-600',
  },
];

async function seedCategories() {
  console.log('🌱 Starting category seeding...\n');

  try {
    // Check existing categories
    const existing = await databases.listDocuments(databaseId, collectionId);
    console.log(`📊 Found ${existing.documents.length} existing categories\n`);

    let created = 0;
    let skipped = 0;

    for (const category of DUMMY_CATEGORIES) {
      try {
        // Check if category with this slug already exists
        const existingCategory = existing.documents.find((doc: any) => doc.slug === category.slug);
        
        if (existingCategory) {
          console.log(`⏭️  Skipping "${category.name_az}" - already exists`);
          skipped++;
          continue;
        }

        await databases.createDocument(
          databaseId,
          collectionId,
          ID.unique(),
          category
        );

        console.log(`✅ Created: ${category.name_az} / ${category.name_ru}`);
        created++;
      } catch (error: any) {
        console.error(`❌ Error creating "${category.name_az}":`, error.message);
      }
    }

    console.log(`\n✨ Seeding complete!`);
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${DUMMY_CATEGORIES.length}\n`);
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedCategories();

