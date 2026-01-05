import { Client, Databases, ID, Permission, Role, Query } from 'node-appwrite';
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

interface AdSpaceDefinition {
  name: string;
  slug: string;
  description: string;
  position: string;
  width?: number;
  height?: number;
}

const adSpaces: AdSpaceDefinition[] = [
  // Header Ad Spaces
  {
    name: 'Header Top (Desktop)',
    slug: 'header-top-desktop',
    description: 'Header bölümünün üstündə, navbar-dan əvvəl. Desktop üçün.',
    position: 'header',
    width: 728,
    height: 90,
  },
  {
    name: 'Header Bottom (Desktop)',
    slug: 'header-bottom-desktop',
    description: 'Header bölümünün altında, navbar-dan sonra. Desktop üçün.',
    position: 'header',
    width: 728,
    height: 90,
  },
  
  // Hero Center (already exists, but adding for completeness)
  {
    name: 'Hero Center',
    slug: 'hero-center',
    description: 'Hero bölümünün mərkəzində, emoji yerində. Responsive.',
    position: 'hero-center',
    width: 400,
    height: 300,
  },
  
  // Sidebar Ad Spaces
  {
    name: 'Sidebar Top (Desktop)',
    slug: 'sidebar-top-desktop',
    description: 'Sidebar bölümünün üstündə. Desktop üçün.',
    position: 'sidebar',
    width: 300,
    height: 250,
  },
  {
    name: 'Sidebar Bottom (Desktop)',
    slug: 'sidebar-bottom-desktop',
    description: 'Sidebar bölümünün altında. Desktop üçün.',
    position: 'sidebar',
    width: 300,
    height: 250,
  },
  
  // In-Content Ad Spaces
  {
    name: 'In-Content Top',
    slug: 'in-content-top',
    description: 'Məzmunun ortasında, yuxarıda. Desktop üçün.',
    position: 'in-content',
    width: 728,
    height: 90,
  },
  {
    name: 'In-Content Middle',
    slug: 'in-content-middle',
    description: 'Məzmunun ortasında, ortada. Desktop üçün.',
    position: 'in-content',
    width: 728,
    height: 90,
  },
  
  // Footer Ad Spaces
  {
    name: 'Footer Top',
    slug: 'footer-top',
    description: 'Footer bölümünün üstündə. Desktop üçün.',
    position: 'footer',
    width: 728,
    height: 90,
  },
  {
    name: 'Footer Bottom',
    slug: 'footer-bottom',
    description: 'Footer bölümünün altında. Desktop üçün.',
    position: 'footer',
    width: 728,
    height: 90,
  },
  
  // Mobile Ad Spaces
  {
    name: 'Mobile Banner Top',
    slug: 'mobile-banner-top',
    description: 'Mobil cihazlar üçün yuxarı banner. Yalnız mobil.',
    position: 'mobile-banner',
    width: 320,
    height: 50,
  },
  {
    name: 'Mobile Banner Bottom',
    slug: 'mobile-banner-bottom',
    description: 'Mobil cihazlar üçün aşağı banner. Yalnız mobil.',
    position: 'mobile-banner',
    width: 320,
    height: 50,
  },
  
  // Native Ad Spaces
  {
    name: 'Native Article Top',
    slug: 'native-article-top',
    description: 'Məqalə səhifəsində, məzmunun yuxarısında. Native format.',
    position: 'native',
    width: 300,
    height: 250,
  },
  {
    name: 'Native Article Middle',
    slug: 'native-article-middle',
    description: 'Məqalə səhifəsində, məzmunun ortasında. Native format.',
    position: 'native',
    width: 300,
    height: 250,
  },
  {
    name: 'Native Sidebar',
    slug: 'native-sidebar',
    description: 'Məqalə səhifəsində sidebar-da. Native format.',
    position: 'native',
    width: 300,
    height: 250,
  },
];

async function seedAdSpaces() {
  console.log('🚀 Seeding ad spaces...\n');

  for (const adSpace of adSpaces) {
    try {
      // Check if ad space already exists
      const existing = await databases.listDocuments(
        databaseId,
        'ad_spaces',
        [
          Query.equal('slug', adSpace.slug)
        ]
      );

      if (existing.documents.length > 0) {
        console.log(`⚠️  Ad space '${adSpace.name}' already exists, skipping...`);
        continue;
      }

      // Create ad space
      await databases.createDocument(
        databaseId,
        'ad_spaces',
        ID.unique(),
        {
          name: adSpace.name,
          slug: adSpace.slug,
          description: adSpace.description,
          position: adSpace.position,
          width: adSpace.width,
          height: adSpace.height,
          is_active: true,
        },
        [
          Permission.read(Role.any()),
          Permission.write(Role.users()),
          Permission.delete(Role.users()),
        ]
      );

      console.log(`✅ Created ad space: ${adSpace.name} (${adSpace.width}x${adSpace.height})`);
    } catch (error: any) {
      if (error.code === 409) {
        console.log(`⚠️  Ad space '${adSpace.name}' already exists`);
      } else {
        console.error(`❌ Error creating ad space '${adSpace.name}':`, error.message);
      }
    }
  }

  console.log('\n✨ Ad spaces seeding completed!');
}

seedAdSpaces().catch(console.error);

