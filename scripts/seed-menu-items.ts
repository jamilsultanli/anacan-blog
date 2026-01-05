import { Client, Databases, ID, Query } from 'node-appwrite';
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

interface MenuItem {
  id: string;
  label: string;
  url: string;
  target?: '_blank' | '_self';
  children?: MenuItem[];
}

async function seedMenuItems() {
  console.log('🚀 Seeding menu items from categories and pages...\n');

  try {
    // Get categories
    console.log('📁 Fetching categories...');
    const categoriesResponse = await databases.listDocuments(databaseId, 'categories');
    const categories = categoriesResponse.documents;

    // Get pages
    console.log('📄 Fetching pages...');
    const pagesResponse = await databases.listDocuments(
      databaseId, 
      'pages'
    );
    // Filter published pages if is_published attribute exists, otherwise include all
    const pages = pagesResponse.documents.filter((page: any) => {
      // If is_published attribute exists, only include published pages
      // If attribute doesn't exist (undefined), include all pages
      return page.is_published === undefined || page.is_published === true;
    });

    // Check if header menu exists
    console.log('\n🔍 Checking for existing header menu...');
    const headerMenusResponse = await databases.listDocuments(
      databaseId, 
      'menus', 
      [Query.equal('location', 'header')]
    );

    let headerMenuItems: MenuItem[] = [];
    
    // Add Blog link first
    headerMenuItems.push({
      id: 'blog',
      label: 'Blog',
      label_az: 'Blog',
      label_ru: 'Блог',
      url: '/blog',
      target: '_self'
    });

    // Add Forums link
    headerMenuItems.push({
      id: 'forums',
      label: 'Forumlar',
      label_az: 'Forumlar',
      label_ru: 'Форумы',
      url: '/forums',
      target: '_self'
    });

    // Add categories to header menu with both languages
    categories.forEach((cat: any, index: number) => {
      headerMenuItems.push({
        id: `cat-${cat.$id}`,
        label: cat.name_az, // Fallback label
        label_az: cat.name_az, // Azerbaijani label
        label_ru: cat.name_ru || cat.name_az, // Russian label (fallback to az if not available)
        url: `/category/${cat.slug}`,
        target: '_self'
      });
    });

    if (headerMenusResponse.documents.length > 0) {
      const existingMenu = headerMenusResponse.documents[0];
      const existingItems = existingMenu.items ? JSON.parse(existingMenu.items) : [];
      
      // Merge with existing items (avoid duplicates)
      const existingUrls = new Set(existingItems.map((item: MenuItem) => item.url));
      headerMenuItems.forEach(item => {
        if (!existingUrls.has(item.url)) {
          existingItems.push(item);
        }
      });

      console.log('✅ Updating existing header menu...');
      await databases.updateDocument(
        databaseId,
        'menus',
        existingMenu.$id,
        {
          items: JSON.stringify(existingItems)
        }
      );
      console.log(`✅ Header menu updated with ${headerMenuItems.length} category items`);
    } else {
      console.log('📋 Creating new header menu...');
      await databases.createDocument(
        databaseId,
        'menus',
        ID.unique(),
        {
          name: 'Header Menu',
          location: 'header',
          items: JSON.stringify(headerMenuItems)
        }
      );
      console.log(`✅ Header menu created with ${headerMenuItems.length} category items`);
    }

    // Check if footer menu exists
    console.log('\n🔍 Checking for existing footer menu...');
    const footerMenusResponse = await databases.listDocuments(
      databaseId, 
      'menus', 
      [Query.equal('location', 'footer')]
    );

    let footerMenuItems: MenuItem[] = [];

    // Add static pages to footer menu
    pages.forEach((page: any) => {
      footerMenuItems.push({
        id: `page-${page.$id}`,
        label: page.title_az, // Will be managed from admin panel
        url: `/${page.slug}`,
        target: '_self'
      });
    });

    if (footerMenusResponse.documents.length > 0) {
      const existingMenu = footerMenusResponse.documents[0];
      const existingItems = existingMenu.items ? JSON.parse(existingMenu.items) : [];
      
      // Merge with existing items (avoid duplicates)
      const existingUrls = new Set(existingItems.map((item: MenuItem) => item.url));
      footerMenuItems.forEach(item => {
        if (!existingUrls.has(item.url)) {
          existingItems.push(item);
        }
      });

      console.log('✅ Updating existing footer menu...');
      await databases.updateDocument(
        databaseId,
        'menus',
        existingMenu.$id,
        {
          items: JSON.stringify(existingItems)
        }
      );
      console.log(`✅ Footer menu updated with ${footerMenuItems.length} page items`);
    } else {
      console.log('📋 Creating new footer menu...');
      await databases.createDocument(
        databaseId,
        'menus',
        ID.unique(),
        {
          name: 'Footer Menu',
          location: 'footer',
          items: JSON.stringify(footerMenuItems)
        }
      );
      console.log(`✅ Footer menu created with ${footerMenuItems.length} page items`);
    }

    console.log('\n✨ Menu seeding completed successfully!');
  } catch (error: any) {
    console.error('\n❌ Error seeding menus:', error.message);
    process.exit(1);
  }
}

seedMenuItems();

