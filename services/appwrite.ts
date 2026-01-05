import { Client, Account, Databases, Storage, ID, Query, Permission, Role } from 'appwrite';

// Support both VITE_ and NEXT_PUBLIC_ prefixes for compatibility
const appwriteEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || import.meta.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const appwriteProjectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || import.meta.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '69580ea2002ecc4ff8e1';

if (!appwriteProjectId) {
  console.warn('Appwrite Project ID not found. Please set VITE_APPWRITE_PROJECT_ID');
}

// Create Appwrite client
export const appwriteClient = new Client()
  .setEndpoint(appwriteEndpoint)
  .setProject(appwriteProjectId);

// Initialize services
export const account = new Account(appwriteClient);
export const databases = new Databases(appwriteClient);
export const storage = new Storage(appwriteClient);

// Export ID, Query, Permission, and Role helpers for convenience
export { ID, Query, Permission, Role };

// Database ID (will be set when database is created in Appwrite)
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || import.meta.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'anacan';

// Collection IDs
export const COLLECTIONS = {
  CATEGORIES: 'categories',
  POSTS: 'posts',
  TAGS: 'tags',
  COMMENTS: 'comments',
  COMMENT_REACTIONS: 'comment_reactions',
  POST_LIKES: 'post_likes',
  BOOKMARKS: 'bookmarks',
  USER_PROFILES: 'user_profiles',
  NEWSLETTER_SUBSCRIPTIONS: 'newsletter_subscriptions',
  READING_HISTORY: 'reading_history',
  AD_SPACES: 'ad_spaces',
  ADS: 'ads',
  TRANSLATIONS: 'translations',
  SITE_SETTINGS: 'site_settings',
  POST_TAGS: 'post_tags',
  MENUS: 'menus',
  PAGES: 'pages',
  STORIES: 'stories',
  FOLLOWS: 'follows',
  USER_ACTIVITIES: 'user_activities',
  FORUMS: 'forums',
  FORUM_POSTS: 'forum_posts',
  FORUM_REPLIES: 'forum_replies',
  FORUM_VOTES: 'forum_votes',
} as const;

