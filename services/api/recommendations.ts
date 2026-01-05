import { databases, DATABASE_ID, COLLECTIONS, Query } from '../appwrite';
import { BlogPost } from '../../types';
import { postsService } from './posts';

class RecommendationsService {
  async getRecommendedPosts(
    userId: string,
    limit: number = 5
  ): Promise<{ data: BlogPost[]; error: Error | null }> {
    try {
      // Get user's reading history
      const readingHistory = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.READING_HISTORY,
        [
          Query.equal('user_id', userId),
          Query.orderDesc('read_at'),
          Query.limit(20)
        ]
      );

      // Get user's bookmarks (with error handling for missing collection/attribute)
      let bookmarkedPostIds: string[] = [];
      try {
        const bookmarks = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.BOOKMARKS,
          [
            Query.equal('user_id', userId),
            Query.limit(20)
          ]
        );
        bookmarkedPostIds = bookmarks.documents.map((doc: any) => doc.post_id);
      } catch (bookmarkError: any) {
        // Bookmarks collection or user_id attribute might not exist
        console.warn('Bookmarks feature not available:', bookmarkError.message);
        bookmarkedPostIds = [];
      }

      // Get categories from reading history and bookmarks
      const readPostIds = readingHistory.documents.map((doc: any) => doc.post_id);
      
      // Get posts to analyze categories
      const allPostIds = [...new Set([...readPostIds, ...bookmarkedPostIds])];
      const categories: Record<string, number> = {};

      for (const postId of allPostIds.slice(0, 10)) {
        try {
          const post = await databases.getDocument(DATABASE_ID, COLLECTIONS.POSTS, postId);
          if (post.category_id) {
            categories[post.category_id] = (categories[post.category_id] || 0) + 1;
          }
        } catch (e) {
          // Post might not exist
        }
      }

      // Get top categories
      const topCategories = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([catId]) => catId);

      // Get recommended posts from top categories
      const recommended: BlogPost[] = [];
      for (const categoryId of topCategories) {
        const { data } = await postsService.getPosts({
          categoryId,
          status: 'published',
          limit: Math.ceil(limit / topCategories.length),
        });
        
        if (data) {
          // Filter out already read/bookmarked posts
          const filtered = data.filter(
            p => !readPostIds.includes(p.id) && !bookmarkedPostIds.includes(p.id)
          );
          recommended.push(...filtered);
        }
      }

      // Shuffle and limit
      const shuffled = recommended.sort(() => Math.random() - 0.5);
      return { data: shuffled.slice(0, limit), error: null };
    } catch (error: any) {
      console.error('Error getting recommendations:', error);
      // Fallback to featured posts
      const { data } = await postsService.getPosts({
        status: 'published',
        limit,
      });
      return { data: data || [], error: null };
    }
  }

  async getSimilarPosts(
    postId: string,
    limit: number = 5
  ): Promise<{ data: BlogPost[]; error: Error | null }> {
    try {
      const post = await databases.getDocument(DATABASE_ID, COLLECTIONS.POSTS, postId);
      
      // Get posts from same category
      const { data } = await postsService.getPosts({
        categoryId: post.category_id,
        status: 'published',
        limit: limit + 1, // +1 to exclude current post
      });

      if (data) {
        const similar = data
          .filter(p => p.id !== postId)
          .slice(0, limit);
        return { data: similar, error: null };
      }

      return { data: [], error: null };
    } catch (error: any) {
      console.error('Error getting similar posts:', error);
      return { data: [], error: new Error(error.message || 'Failed to get similar posts') };
    }
  }

  async getTrendingInInterests(
    userId: string,
    limit: number = 5
  ): Promise<{ data: BlogPost[]; error: Error | null }> {
    try {
      // Similar to getRecommendedPosts but focuses on trending
      const { data: allPosts } = await postsService.getPosts({
        status: 'published',
        limit: 50,
      });

      if (!data) {
        return { data: [], error: null };
      }

      // Sort by view count and get top posts
      const trending = [...allPosts]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, limit);

      return { data: trending, error: null };
    } catch (error: any) {
      console.error('Error getting trending posts:', error);
      return { data: [], error: new Error(error.message || 'Failed to get trending posts') };
    }
  }
}

export const recommendationsService = new RecommendationsService();

