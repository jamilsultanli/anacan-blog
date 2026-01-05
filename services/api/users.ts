import { databases, DATABASE_ID, COLLECTIONS, ID, Query, account } from '../appwrite';
import { User, UserProfile, BlogPost, Bookmark, ReadingHistory } from '../../types';

class UsersService {
  async getUserProfile(userId: string): Promise<{ data: User | null; error: Error | null }> {
    try {
      const profile = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        userId
      );

      // Try to get account email
      let email = profile.email;
      try {
        const accountUser = await account.get();
        if (accountUser.$id === userId) {
          email = accountUser.email;
        }
      } catch (e) {
        // Can't get account info, use profile email
      }

      const user: User = {
        id: profile.$id,
        email: email,
        username: profile.username,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        role: profile.role,
        createdAt: profile.$createdAt ? new Date(profile.$createdAt).toISOString() : undefined,
        updatedAt: profile.$updatedAt ? new Date(profile.$updatedAt).toISOString() : undefined,
      };

      return { data: user, error: null };
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      return { data: null, error: new Error(error.message || 'Failed to get user profile') };
    }
  }

  async getUserPosts(userId: string): Promise<{ data: BlogPost[]; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.POSTS,
        [
          Query.equal('author_id', userId),
          Query.orderDesc('$createdAt')
        ]
      );

      const posts: BlogPost[] = (response.documents || []).map((post: any) => ({
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
        author: post.author_name || '',
        authorId: post.author_id,
        published_at: post.published_at,
        imageUrl: post.image_url || '',
        readTime: post.read_time || 5,
        tags: [],
        isFeatured: post.is_featured || false,
        status: post.status,
        viewCount: post.view_count || 0,
        createdAt: post.$createdAt ? new Date(post.$createdAt).toISOString() : undefined,
        updatedAt: post.$updatedAt ? new Date(post.$updatedAt).toISOString() : undefined,
      }));

      return { data: posts, error: null };
    } catch (error: any) {
      console.error('Error getting user posts:', error);
      return { data: [], error: new Error(error.message || 'Failed to get user posts') };
    }
  }

  async getBookmarks(userId: string): Promise<{ data: Bookmark[]; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.BOOKMARKS,
        [
          Query.equal('user_id', userId),
          Query.orderDesc('$createdAt')
        ]
      );

      const bookmarks: Bookmark[] = (response.documents || []).map((b: any) => ({
        postId: b.post_id,
        userId: b.user_id,
        createdAt: b.$createdAt ? new Date(b.$createdAt).toISOString() : undefined,
      }));

      return { data: bookmarks, error: null };
    } catch (error: any) {
      console.error('Error getting bookmarks:', error);
      return { data: [], error: new Error(error.message || 'Failed to get bookmarks') };
    }
  }

  async addBookmark(postId: string): Promise<{ error: Error | null }> {
    try {
      const user = await account.get();
      if (!user) throw new Error('User not authenticated');

      // Check if bookmark already exists
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.BOOKMARKS,
        [
          Query.equal('post_id', postId),
          Query.equal('user_id', user.$id),
          Query.limit(1)
        ]
      );

      if (existing.documents.length === 0) {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.BOOKMARKS,
          ID.unique(),
          {
            post_id: postId,
            user_id: user.$id,
          }
        );
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error adding bookmark:', error);
      return { error: new Error(error.message || 'Failed to add bookmark') };
    }
  }

  async removeBookmark(postId: string): Promise<{ error: Error | null }> {
    try {
      const user = await account.get();
      if (!user) throw new Error('User not authenticated');

      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.BOOKMARKS,
        [
          Query.equal('post_id', postId),
          Query.equal('user_id', user.$id),
          Query.limit(1)
        ]
      );

      if (existing.documents.length > 0) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTIONS.BOOKMARKS,
          existing.documents[0].$id
        );
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error removing bookmark:', error);
      return { error: new Error(error.message || 'Failed to remove bookmark') };
    }
  }

  async getReadingHistory(userId: string, limit = 20): Promise<{ data: ReadingHistory[]; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.READING_HISTORY,
        [
          Query.equal('user_id', userId),
          Query.orderDesc('read_at'),
          Query.limit(limit)
        ]
      );

      const history: ReadingHistory[] = (response.documents || []).map((h: any) => ({
        id: h.$id,
        userId: h.user_id,
        postId: h.post_id,
        readAt: h.read_at ? new Date(h.read_at).toISOString() : undefined,
      }));

      return { data: history, error: null };
    } catch (error: any) {
      console.error('Error getting reading history:', error);
      return { data: [], error: new Error(error.message || 'Failed to get reading history') };
    }
  }

  async addToReadingHistory(postId: string): Promise<{ error: Error | null }> {
    try {
      const user = await account.get();
      if (!user) throw new Error('User not authenticated');

      // Check if entry already exists
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.READING_HISTORY,
        [
          Query.equal('post_id', postId),
          Query.equal('user_id', user.$id),
          Query.limit(1)
        ]
      );

      if (existing.documents.length > 0) {
        // Update existing entry
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.READING_HISTORY,
          existing.documents[0].$id,
          { read_at: new Date().toISOString() }
        );
      } else {
        // Create new entry
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.READING_HISTORY,
          ID.unique(),
          {
            post_id: postId,
            user_id: user.$id,
            read_at: new Date().toISOString(),
          }
        );
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error adding to reading history:', error);
      return { error: new Error(error.message || 'Failed to add to reading history') };
    }
  }
}

export const usersService = new UsersService();
