
import { BlogPost, Category, Locale } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { postsService } from './api/posts';
import { categoriesService } from './api/categories';

// Initial Data Seeding
const INITIAL_CATEGORIES: Category[] = [
  { id: '1', slug: 'pregnancy', name: { az: 'Hamiləlik', ru: 'Беременность' }, icon: '🤰', color: 'bg-pink-100 text-pink-600' },
  { id: '2', slug: 'baby', name: { az: 'Körpə', ru: 'Малыш' }, icon: '👶', color: 'bg-blue-100 text-blue-600' },
  { id: '3', slug: 'parenting', name: { az: 'Tərbiyə', ru: 'Воспитание' }, icon: '👨‍👩‍👧', color: 'bg-green-100 text-green-600' },
  { id: '4', slug: 'health', name: { az: 'Sağlamlıq', ru: 'Здоровье' }, icon: '🩺', color: 'bg-red-100 text-red-600' },
  { id: '5', slug: 'selfcare', name: { az: 'Özünə Qulluq', ru: 'Уход за собой' }, icon: '🧘‍♀️', color: 'bg-purple-100 text-purple-600' },
];

const INITIAL_POSTS: BlogPost[] = [
  {
    id: '101',
    slug: 'first-trimester-tips',
    title: { az: 'Hamiləliyin ilk trimestrində nələrə diqqət etməli?', ru: 'На что обратить внимание в первом триместре?' },
    excerpt: { az: 'Hamiləliyin ilk aylarında bədəndə baş verən dəyişikliklər...', ru: 'Изменения в организме в первые месяцы беременности...' },
    content: { 
        az: `Hamiləliyin ilk trimestri (1-13-cü həftələr) həm həyəcanlı, həm də çətin bir dövrdür...`, 
        ru: `Первый триместр беременности (1-13 недели) – это волнительный период...` 
    },
    categoryId: '1',
    author: 'Dr. Sevinc Əliyeva',
    published_at: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1518104593124-ac2e82a5eb9d?auto=format&fit=crop&q=80&w=800',
    readTime: 5,
    tags: [],
    isFeatured: true,
    status: 'published'
  },
  {
    id: '102',
    slug: 'baby-sleep-guide',
    title: { az: 'Yeni doğulmuş körpələrdə yuxu rejimi', ru: 'Режим сна у новорожденных' },
    excerpt: { az: 'Körpənizin sağlam böyüməsi üçün yuxu rejimi...', ru: 'Режим сна важен для здорового роста малыша...' },
    content: { az: 'Körpələr ilk aylarda...', ru: 'В первые месяцы малыши...' },
    categoryId: '2',
    author: 'Günay Məmmədova',
    published_at: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800',
    readTime: 7,
    tags: [],
    isFeatured: false,
    status: 'published'
  }
];

// Helper to simulate DB delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class DatabaseService {
  constructor() {
    // Check if we need to migrate or reset data due to schema changes
    const savedPosts = localStorage.getItem('anacan_posts');
    if (savedPosts) {
      try {
        const parsed = JSON.parse(savedPosts);
        // Check if data matches new schema (e.g. has slug property and localized title)
        if (parsed.length > 0 && (!parsed[0].slug || typeof parsed[0].title === 'string')) {
          console.log("Old data detected, resetting DB...");
          localStorage.removeItem('anacan_posts');
          localStorage.removeItem('anacan_categories');
        }
      } catch (e) {
        localStorage.removeItem('anacan_posts');
      }
    }

    if (!localStorage.getItem('anacan_posts')) {
      localStorage.setItem('anacan_posts', JSON.stringify(INITIAL_POSTS));
    }
    if (!localStorage.getItem('anacan_categories')) {
      localStorage.setItem('anacan_categories', JSON.stringify(INITIAL_CATEGORIES));
    }
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    // Try Appwrite first
    try {
      const { data, error } = await categoriesService.getCategories();
      if (!error && data.length > 0) return data;
    } catch (e) {
      // Appwrite failed, fallback
    }
    
    // Fallback to localStorage
    await delay(100);
    return JSON.parse(localStorage.getItem('anacan_categories') || '[]');
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    // Try Appwrite first
    try {
      const { data, error } = await categoriesService.getCategoryBySlug(slug);
      if (!error && data) return data;
    } catch (e) {
      // Appwrite failed, fallback
    }
    
    // Fallback to localStorage
    const cats = await this.getCategories();
    return cats.find(c => c.slug === slug);
  }

  // --- Posts ---
  async getPosts(filter?: { categoryId?: string, isFeatured?: boolean, status?: string, search?: string, locale?: Locale }): Promise<BlogPost[]> {
    // Try Appwrite first
    try {
      const result = await postsService.getPosts({
        categoryId: filter?.categoryId,
        isFeatured: filter?.isFeatured,
        status: filter?.status || 'published',
        search: filter?.search,
        locale: filter?.locale,
      });
      
      // Return Appwrite data even if empty
      if (!result.error) {
        return result.data || [];
      }
    } catch (e) {
      // Appwrite failed, fallback
    }
    
    // Fallback to localStorage
    await delay(200);
    let posts: BlogPost[] = JSON.parse(localStorage.getItem('anacan_posts') || '[]');
    
    // Sort by date desc
    posts.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    if (filter) {
      if (filter.status) posts = posts.filter(p => p.status === filter.status);
      if (filter.categoryId) posts = posts.filter(p => p.categoryId === filter.categoryId);
      if (filter.isFeatured !== undefined) posts = posts.filter(p => p.isFeatured === filter.isFeatured);
      if (filter.search && filter.locale) {
        const q = filter.search.toLowerCase();
        posts = posts.filter(p => 
          p.title[filter.locale!].toLowerCase().includes(q) || 
          p.excerpt[filter.locale!].toLowerCase().includes(q)
        );
      }
    }
    return posts;
  }

  async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    // Try Appwrite first
    try {
      const { data, error } = await postsService.getPostBySlug(slug);
      if (!error && data) return data;
    } catch (e) {
      // Appwrite failed, fallback
    }
    
    // Fallback to localStorage
    const posts = await this.getPosts();
    return posts.find(p => p.slug === slug);
  }

  // --- Admin Methods ---
  
  async createPost(post: Omit<BlogPost, 'id' | 'published_at'>): Promise<BlogPost> {
    // Try Appwrite first
    try {
      const { data, error } = await postsService.createPost(post);
      if (!error && data) return data;
    } catch (e) {
      // Appwrite failed, fallback
    }
    
    // Fallback to localStorage
    const newPost: BlogPost = {
      ...post,
      id: uuidv4(),
      published_at: new Date().toISOString()
    };
    const posts = await this.getPosts();
    posts.unshift(newPost);
    localStorage.setItem('anacan_posts', JSON.stringify(posts));
    return newPost;
  }

  async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    // Try Appwrite first
    try {
      const { data, error } = await postsService.updatePost(id, updates);
      if (!error && data) return data;
    } catch (e) {
      // Appwrite failed, fallback
    }
    
    // Fallback to localStorage
    const posts = await this.getPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Post not found');
    
    posts[index] = { ...posts[index], ...updates };
    localStorage.setItem('anacan_posts', JSON.stringify(posts));
    return posts[index];
  }

  async deletePost(id: string): Promise<void> {
    // Try Appwrite first
    try {
      const { error } = await postsService.deletePost(id);
      if (!error) return;
    } catch (e) {
      // Appwrite failed, fallback
    }
    
    // Fallback to localStorage
    let posts = await this.getPosts();
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem('anacan_posts', JSON.stringify(posts));
  }
}

export const db = new DatabaseService();
