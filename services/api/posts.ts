import { databases, DATABASE_ID, COLLECTIONS, ID, Query, account } from '../appwrite';
import { BlogPost, Category, Tag, Locale } from '../../types';
import { cache } from '../cache';

class PostsService {
  async getPosts(filter?: {
    categoryId?: string;
    isFeatured?: boolean;
    status?: string;
    search?: string;
    locale?: Locale;
    limit?: number;
    offset?: number;
  }): Promise<{ data: BlogPost[]; count: number; error: Error | null }> {
    try {
      // Generate cache key
      const cacheKey = `posts_${JSON.stringify(filter)}`;
      const cached = cache.get<{ data: BlogPost[]; count: number }>(cacheKey);
      if (cached) {
        return { ...cached, error: null };
      }

      // Build queries array for Appwrite
      const queries: string[] = [];
      
      // Status filter (only if specified, otherwise get all)
      if (filter?.status) {
        queries.push(Query.equal('status', filter.status));
      }

      if (filter?.categoryId) {
        queries.push(Query.equal('category_id', filter.categoryId));
      }

      if (filter?.isFeatured !== undefined) {
        queries.push(Query.equal('is_featured', filter.isFeatured));
      }

      if (filter?.search && filter.locale) {
        const localeField = filter.locale === 'az' ? 'title_az' : 'title_ru';
        queries.push(Query.search(localeField, filter.search));
      }

      // Order by createdAt descending (newest first)
      queries.push(Query.orderDesc('$createdAt'));

      // Limit and offset
      const limit = filter?.limit || 10;
      const offset = filter?.offset || 0;
      queries.push(Query.limit(limit));
      queries.push(Query.offset(offset));

      // Fetch posts
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.POSTS,
        queries
      );

      // Fetch categories for posts
      const categoryIds = [...new Set((response.documents || []).map((p: any) => p.category_id).filter(Boolean))];
      const categoriesMap = new Map<string, any>();
      
      if (categoryIds.length > 0) {
        try {
          const categoriesResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CATEGORIES,
            [Query.equal('$id', categoryIds)]
          );
          categoriesResponse.documents.forEach((cat: any) => {
            categoriesMap.set(cat.$id, cat);
          });
        } catch (e) {
          // Categories fetch failed, continue without them
        }
      }

      const posts: BlogPost[] = (response.documents || []).map((post: any) => {
        const category = post.category_id ? categoriesMap.get(post.category_id) : null;
        
        return {
          id: post.$id,
          slug: post.slug,
          title: {
            az: post.title_az,
            ru: post.title_ru,
          },
          excerpt: {
            az: post.excerpt_az || '',
            ru: post.excerpt_ru || '',
          },
          content: {
            az: post.content_az,
            ru: post.content_ru,
          },
          categoryId: post.category_id,
          category: category ? {
            id: category.$id,
            slug: category.slug,
            name: { az: category.name_az, ru: category.name_ru },
            icon: category.icon,
            color: category.color,
          } : undefined,
          author: post.author_name || '',
          authorId: post.author_id,
          published_at: post.published_at,
          imageUrl: post.image_url || '',
          readTime: post.read_time || 5,
          tags: [], // Will be populated separately if needed
          isFeatured: post.is_featured || false,
          status: post.status,
          viewCount: post.view_count || 0,
          createdAt: post.$createdAt ? new Date(post.$createdAt).toISOString() : undefined,
          updatedAt: post.$updatedAt ? new Date(post.$updatedAt).toISOString() : undefined,
        };
      });

      // Sort by creation date (newest first) - client-side fallback
      posts.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.published_at || 0).getTime();
        const dateB = new Date(b.createdAt || b.published_at || 0).getTime();
        return dateB - dateA; // Newest first
      });

      const result = { data: posts, count: response.total || 0, error: null };
      // Cache for 30 seconds
      cache.set(cacheKey, result, 30 * 1000);
      return result;
    } catch (error: any) {
      console.error('Error getting posts:', error);
      return { data: [], count: 0, error: new Error(error.message || 'Failed to get posts') };
    }
  }

  async getPostById(postId: string): Promise<{ data: BlogPost | null; error: Error | null }> {
    try {
      const postDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.POSTS, postId);
      
      // Fetch category if exists
      let category = null;
      if (postDoc.category_id) {
        try {
          category = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.CATEGORIES,
            postDoc.category_id
          );
        } catch (e) {
          // Category fetch failed
        }
      }

      const post: BlogPost = {
        id: postDoc.$id,
        slug: postDoc.slug,
        title: {
          az: postDoc.title_az,
          ru: postDoc.title_ru,
        },
        excerpt: {
          az: postDoc.excerpt_az || '',
          ru: postDoc.excerpt_ru || '',
        },
        content: {
          az: postDoc.content_az,
          ru: postDoc.content_ru,
        },
        categoryId: postDoc.category_id,
        category: category ? {
          id: category.$id,
          slug: category.slug,
          name: { az: category.name_az, ru: category.name_ru },
          icon: category.icon,
          color: category.color,
        } : undefined,
        author: postDoc.author_name || '',
        authorId: postDoc.author_id,
        published_at: postDoc.published_at,
        imageUrl: postDoc.image_url || '',
        readTime: postDoc.read_time || 5,
        tags: [],
        isFeatured: postDoc.is_featured || false,
        status: postDoc.status,
        viewCount: postDoc.view_count || 0,
        createdAt: postDoc.$createdAt ? new Date(postDoc.$createdAt).toISOString() : undefined,
        updatedAt: postDoc.$updatedAt ? new Date(postDoc.$updatedAt).toISOString() : undefined,
      };

      return { data: post, error: null };
    } catch (error: any) {
      console.error('Error getting post by ID:', error);
      return { data: null, error: new Error(error.message || 'Failed to get post') };
    }
  }

  async getPostBySlug(slug: string): Promise<{ data: BlogPost | null; error: Error | null }> {
    try {
      const cacheKey = `post_slug_${slug}`;
      const cached = cache.get<BlogPost>(cacheKey);
      if (cached) {
        return { data: cached, error: null };
      }

      // Fetch post by slug
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.POSTS,
        [Query.equal('slug', slug), Query.limit(1)]
      );

      if (!response.documents || response.documents.length === 0) {
        return { data: null, error: null };
      }

      const data = response.documents[0];

      // Increment view count
      try {
        const currentViews = data.view_count || 0;
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.POSTS,
          data.$id,
          { view_count: currentViews + 1 }
        );
      } catch (e) {
        // View count update failed, continue
      }

      // Fetch category if exists
      let category = null;
      if (data.category_id) {
        try {
          category = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.CATEGORIES,
            data.category_id
          );
        } catch (e) {
          // Category fetch failed
        }
      }

      const post: BlogPost = {
        id: data.$id,
        slug: data.slug,
        title: {
          az: data.title_az,
          ru: data.title_ru,
        },
        excerpt: {
          az: data.excerpt_az || '',
          ru: data.excerpt_ru || '',
        },
        content: {
          az: data.content_az,
          ru: data.content_ru,
        },
        categoryId: data.category_id,
        category: category ? {
          id: category.$id,
          slug: category.slug,
          name: { az: category.name_az, ru: category.name_ru },
          icon: category.icon,
          color: category.color,
        } : undefined,
        author: data.author_name || '',
        authorId: data.author_id,
        published_at: data.published_at,
        imageUrl: data.image_url || '',
        readTime: data.read_time || 5,
        tags: [],
        isFeatured: data.is_featured || false,
        status: data.status,
        viewCount: (data.view_count || 0) + 1, // Incremented
        createdAt: data.$createdAt ? new Date(data.$createdAt).toISOString() : undefined,
        updatedAt: data.$updatedAt ? new Date(data.$updatedAt).toISOString() : undefined,
      };

      // Cache for 30 seconds
      cache.set(cacheKey, post, 30 * 1000);
      return { data: post, error: null };
    } catch (error: any) {
      console.error('Error getting post by slug:', error);
      return { data: null, error: new Error(error.message || 'Failed to get post') };
    }
  }

  async createPost(post: Omit<BlogPost, 'id' | 'published_at' | 'createdAt' | 'updatedAt'>): Promise<{ data: BlogPost | null; error: Error | null }> {
    try {
      const user = await account.get();
      if (!user) throw new Error('User not authenticated');

      const postData: any = {
        slug: post.slug,
        title_az: post.title.az,
        title_ru: post.title.ru,
        excerpt_az: post.excerpt.az,
        excerpt_ru: post.excerpt.ru,
        content_az: post.content.az,
        content_ru: post.content.ru,
        category_id: post.categoryId || null,
        author_id: user.$id,
        author_name: post.author,
        image_url: post.imageUrl || null,
        read_time: post.readTime || 5,
        is_featured: post.isFeatured || false,
        status: post.status,
        published_at: post.status === 'published' ? new Date().toISOString() : null,
        view_count: 0,
      };

      const created = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.POSTS,
        ID.unique(),
        postData
      );

      // Add tags if provided
      if (post.tags && post.tags.length > 0) {
        await this.addTagsToPost(created.$id, post.tags);
      }

      // Clear cache
      cache.clearPattern('posts_');

      const newPost: BlogPost = {
        id: created.$id,
        slug: created.slug,
        title: { az: created.title_az, ru: created.title_ru },
        excerpt: { az: created.excerpt_az || '', ru: created.excerpt_ru || '' },
        content: { az: created.content_az, ru: created.content_ru },
        categoryId: created.category_id,
        author: created.author_name || '',
        authorId: created.author_id,
        published_at: created.published_at || new Date().toISOString(),
        imageUrl: created.image_url || '',
        readTime: created.read_time || 5,
        tags: post.tags || [],
        isFeatured: created.is_featured || false,
        status: created.status,
        viewCount: 0,
        createdAt: created.$createdAt ? new Date(created.$createdAt).toISOString() : undefined,
        updatedAt: created.$updatedAt ? new Date(created.$updatedAt).toISOString() : undefined,
      };

      return { data: newPost, error: null };
    } catch (error: any) {
      console.error('Error creating post:', error);
      return { data: null, error: new Error(error.message || 'Failed to create post') };
    }
  }

  async updatePost(id: string, updates: Partial<BlogPost>): Promise<{ data: BlogPost | null; error: Error | null }> {
    try {
      const updateData: any = {};

      if (updates.slug) updateData.slug = updates.slug;
      if (updates.title) {
        updateData.title_az = updates.title.az;
        updateData.title_ru = updates.title.ru;
      }
      if (updates.excerpt) {
        updateData.excerpt_az = updates.excerpt.az;
        updateData.excerpt_ru = updates.excerpt.ru;
      }
      if (updates.content) {
        updateData.content_az = updates.content.az;
        updateData.content_ru = updates.content.ru;
      }
      if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
      if (updates.readTime !== undefined) updateData.read_time = updates.readTime;
      if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;
      if (updates.status) {
        updateData.status = updates.status;
        if (updates.status === 'published' && !updateData.published_at) {
          updateData.published_at = new Date().toISOString();
        }
      }

      const updated = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.POSTS,
        id,
        updateData
      );

      // Update tags if provided
      if (updates.tags) {
        await this.removeAllTagsFromPost(id);
        if (updates.tags.length > 0) {
          await this.addTagsToPost(id, updates.tags);
        }
      }

      // Clear cache
      cache.clearPattern('posts_');
      cache.delete(`post_slug_${updated.slug}`);

      const updatedPost: BlogPost = {
        id: updated.$id,
        slug: updated.slug,
        title: { az: updated.title_az, ru: updated.title_ru },
        excerpt: { az: updated.excerpt_az || '', ru: updated.excerpt_ru || '' },
        content: { az: updated.content_az, ru: updated.content_ru },
        categoryId: updated.category_id,
        author: updated.author_name || '',
        authorId: updated.author_id,
        published_at: updated.published_at || new Date().toISOString(),
        imageUrl: updated.image_url || '',
        readTime: updated.read_time || 5,
        tags: updates.tags || [],
        isFeatured: updated.is_featured || false,
        status: updated.status,
        viewCount: updated.view_count || 0,
        createdAt: updated.$createdAt ? new Date(updated.$createdAt).toISOString() : undefined,
        updatedAt: updated.$updatedAt ? new Date(updated.$updatedAt).toISOString() : undefined,
      };

      return { data: updatedPost, error: null };
    } catch (error: any) {
      console.error('Error updating post:', error);
      return { data: null, error: new Error(error.message || 'Failed to update post') };
    }
  }

  async deletePost(id: string): Promise<{ error: Error | null }> {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.POSTS, id);
      
      // Clear cache
      cache.clearPattern('posts_');
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting post:', error);
      return { error: new Error(error.message || 'Failed to delete post') };
    }
  }

  private async addTagsToPost(postId: string, tagIds: string[]): Promise<void> {
    // In Appwrite, we need to create documents in post_tags collection
    // Note: This assumes post_tags is a separate collection
    // If using array attribute, we'd update the post document instead
    for (const tagId of tagIds) {
      try {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.POST_TAGS,
          ID.unique(),
          {
            post_id: postId,
            tag_id: tagId,
          }
        );
      } catch (e) {
        // Tag relation might already exist, continue
      }
    }
  }

  private async removeAllTagsFromPost(postId: string): Promise<void> {
    try {
      // Fetch all post_tags for this post
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.POST_TAGS,
        [Query.equal('post_id', postId)]
      );

      // Delete each tag relation
      for (const doc of response.documents) {
        try {
          await databases.deleteDocument(DATABASE_ID, COLLECTIONS.POST_TAGS, doc.$id);
        } catch (e) {
          // Continue if deletion fails
        }
      }
    } catch (e) {
      // No tags to remove or collection doesn't exist
    }
  }
}

export const postsService = new PostsService();
