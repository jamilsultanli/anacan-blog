import { Client, Databases, ID, Permission, Role, Query } from 'node-appwrite';
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

const forumCategories = [
  {
    name_az: 'Hamiləlik',
    name_ru: 'Беременность',
    slug: 'hamilelik',
    description_az: 'Hamiləlik dövrü, doğum hazırlığı və hamiləlik məsləhətləri',
    description_ru: 'Период беременности, подготовка к родам и советы по беременности',
    icon: '🤰',
    color: '#ec4899',
    order: 1,
  },
  {
    name_az: 'Doğum və Sonrası',
    name_ru: 'Роды и после',
    slug: 'dogum-ve-sonrasi',
    description_az: 'Doğum prosesi, doğumdan sonra bərpa və ilk günlər',
    description_ru: 'Процесс родов, восстановление после родов и первые дни',
    icon: '👶',
    color: '#f59e0b',
    order: 2,
  },
  {
    name_az: 'Uşaq Tərbiyəsi',
    name_ru: 'Воспитание детей',
    slug: 'usaq-terbiyesi',
    description_az: 'Uşaqların tərbiyəsi, davranış problemləri və tərbiyə üsulları',
    description_ru: 'Воспитание детей, проблемы поведения и методы воспитания',
    icon: '👨‍👩‍👧',
    color: '#10b981',
    order: 3,
  },
  {
    name_az: 'Sağlamlıq və Qidalanma',
    name_ru: 'Здоровье и питание',
    slug: 'saglamliq-ve-qidalanma',
    description_az: 'Uşaqların sağlamlığı, qidalanma və sağlam həyat tərzi',
    description_ru: 'Здоровье детей, питание и здоровый образ жизни',
    icon: '💚',
    color: '#3b82f6',
    order: 4,
  },
  {
    name_az: 'Təhsil və İnkişaf',
    name_ru: 'Образование и развитие',
    slug: 'tehsil-ve-inkisaf',
    description_az: 'Uşaqların təhsili, inkişafı və öyrənmə prosesləri',
    description_ru: 'Образование детей, развитие и процессы обучения',
    icon: '📚',
    color: '#8b5cf6',
    order: 5,
  },
  {
    name_az: 'Ailə Həyatı',
    name_ru: 'Семейная жизнь',
    slug: 'aile-heyati',
    description_az: 'Ailə münasibətləri, ailə problemləri və həll yolları',
    description_ru: 'Семейные отношения, семейные проблемы и решения',
    icon: '❤️',
    color: '#ef4444',
    order: 6,
  },
  {
    name_az: 'Geyim və Moda',
    name_ru: 'Одежда и мода',
    slug: 'geyim-ve-moda',
    description_az: 'Hamiləlik və uşaq geyimləri, moda məsləhətləri',
    description_ru: 'Одежда для беременных и детей, советы по моде',
    icon: '👗',
    color: '#ec4899',
    order: 7,
  },
  {
    name_az: 'Əyləncə və Aktivliklər',
    name_ru: 'Развлечения и активности',
    slug: 'eylence-ve-aktivlikler',
    description_az: 'Uşaqlarla əyləncə, oyunlar və aktivliklər',
    description_ru: 'Развлечения с детьми, игры и активности',
    icon: '🎮',
    color: '#f59e0b',
    order: 8,
  },
];

async function seedForumCategories() {
  console.log('🚀 Seeding forum categories...\n');

  try {
    for (const category of forumCategories) {
      try {
        // Check if category already exists
        const existing = await databases.listDocuments(
          databaseId,
          'forums',
          [
            Query.equal('slug', category.slug),
            Query.limit(1)
          ]
        );

        if (existing.documents.length > 0) {
          console.log(`⚠️  Forum category '${category.name_az}' already exists, skipping...`);
          continue;
        }

        // Create forum category
        await databases.createDocument(
          databaseId,
          'forums',
          ID.unique(),
          {
            ...category,
            is_active: true,
          },
          [
            Permission.read(Role.any()),
            Permission.write(Role.users()),
            Permission.delete(Role.users()),
          ]
        );

        console.log(`✅ Created forum category: ${category.name_az} / ${category.name_ru}`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`⚠️  Forum category '${category.name_az}' already exists`);
        } else {
          console.error(`❌ Error creating forum category '${category.name_az}':`, error.message);
        }
      }
    }

    console.log('\n✨ Forum categories seeding completed!');
  } catch (error: any) {
    console.error('\n❌ Error seeding forum categories:', error.message);
    process.exit(1);
  }
}

seedForumCategories().catch(console.error);

