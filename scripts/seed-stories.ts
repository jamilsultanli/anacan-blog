import { Client, Databases, ID } from 'node-appwrite';
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

// Dummy Stories Data
const dummyStories = [
  {
    title_az: 'Hamiləlik Məsləhətləri',
    title_ru: 'Советы по беременности',
    image_url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1080&h=1920&fit=crop',
    link_url: '/category/pregnancy',
    link_text_az: 'Daha çox',
    link_text_ru: 'Подробнее',
    is_active: true,
    order: 1,
  },
  {
    title_az: 'Körpə Baxımı',
    title_ru: 'Уход за малышом',
    image_url: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=1080&h=1920&fit=crop',
    link_url: '/category/baby',
    link_text_az: 'Oxu',
    link_text_ru: 'Читать',
    is_active: true,
    order: 2,
  },
  {
    title_az: 'Ana Sağlamlığı',
    title_ru: 'Здоровье мамы',
    image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1080&h=1920&fit=crop',
    link_url: '/category/health',
    link_text_az: 'Kəşf et',
    link_text_ru: 'Исследовать',
    is_active: true,
    order: 3,
  },
  {
    title_az: 'Tərbiyə Tövsiyələri',
    title_ru: 'Советы по воспитанию',
    image_url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1080&h=1920&fit=crop',
    link_url: '/category/parenting',
    link_text_az: 'Öyrən',
    link_text_ru: 'Узнать',
    is_active: true,
    order: 4,
  },
  {
    title_az: 'Qidalanma Planı',
    title_ru: 'План питания',
    image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1080&h=1920&fit=crop',
    link_url: '/category/nutrition',
    link_text_az: 'Bax',
    link_text_ru: 'Посмотреть',
    is_active: true,
    order: 5,
  },
  {
    title_az: 'Özünə Qulluq',
    title_ru: 'Уход за собой',
    image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1080&h=1920&fit=crop',
    link_url: '/category/selfcare',
    link_text_az: 'Daha çox',
    link_text_ru: 'Подробнее',
    is_active: true,
    order: 6,
  },
  {
    title_az: 'Uşaq Tərbiyəsi',
    title_ru: 'Воспитание детей',
    image_url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1080&h=1920&fit=crop',
    link_url: '/category/education',
    link_text_az: 'Oxu',
    link_text_ru: 'Читать',
    is_active: true,
    order: 7,
  },
  {
    title_az: 'Ana Məsləhətləri',
    title_ru: 'Советы мамы',
    image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1080&h=1920&fit=crop',
    link_url: '/blog',
    link_text_az: 'Hamısına bax',
    link_text_ru: 'Посмотреть все',
    is_active: true,
    order: 8,
  },
];

async function seedStories() {
  console.log('🚀 Seeding stories...\n');

  try {
    for (const story of dummyStories) {
      try {
        await databases.createDocument(
          databaseId,
          'stories',
          ID.unique(),
          story
        );
        console.log(`✅ Story created: ${story.title_az}`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`⚠️  Story already exists: ${story.title_az}`);
        } else {
          console.error(`❌ Error creating story ${story.title_az}:`, error.message);
        }
      }
    }

    console.log('\n✨ Stories seeding completed!');
  } catch (error: any) {
    console.error('\n❌ Error seeding stories:', error.message);
    process.exit(1);
  }
}

seedStories();

