import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '../../services/db';
import { BlogPost, Category } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('DatabaseService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should get categories', async () => {
    const categories = await db.getCategories();
    expect(Array.isArray(categories)).toBe(true);
  });

  it('should get posts', async () => {
    const posts = await db.getPosts();
    expect(Array.isArray(posts)).toBe(true);
  });

  it('should filter posts by category', async () => {
    const posts = await db.getPosts({ categoryId: '1' });
    expect(Array.isArray(posts)).toBe(true);
  });

  it('should get post by slug', async () => {
    // First create a post
    const newPost: Omit<BlogPost, 'id' | 'published_at'> = {
      slug: 'test-slug',
      title: { az: 'Test', ru: 'Тест' },
      excerpt: { az: 'Test', ru: 'Тест' },
      content: { az: 'Test', ru: 'Тест' },
      categoryId: '1',
      author: 'Test Author',
      imageUrl: 'https://example.com/image.jpg',
      readTime: 5,
      tags: [],
      isFeatured: false,
      status: 'published',
    };

    await db.createPost(newPost);
    const post = await db.getPostBySlug('test-slug');
    expect(post).toBeDefined();
    expect(post?.slug).toBe('test-slug');
  });
});

