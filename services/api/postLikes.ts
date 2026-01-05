import { databases, DATABASE_ID, COLLECTIONS, ID, Query, account } from '../appwrite';

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  createdAt?: string;
}

class PostLikesService {
  async getLikesByPost(postId: string): Promise<{ data: PostLike[]; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.POST_LIKES,
        [Query.equal('post_id', postId)]
      );

      const likes: PostLike[] = (response.documents || []).map((doc: any) => ({
        id: doc.$id,
        postId: doc.post_id,
        userId: doc.user_id,
        createdAt: doc.$createdAt,
      }));

      return { data: likes, error: null };
    } catch (error: any) {
      console.error('Error getting likes:', error);
      return { data: [], error: new Error(error.message || 'Failed to get likes') };
    }
  }

  async getLikeCount(postId: string): Promise<{ count: number; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.POST_LIKES,
        [Query.equal('post_id', postId)]
      );

      return { count: response.total, error: null };
    } catch (error: any) {
      console.error('Error getting like count:', error);
      return { count: 0, error: new Error(error.message || 'Failed to get like count') };
    }
  }

  async checkUserLiked(postId: string, userId: string): Promise<{ liked: boolean; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.POST_LIKES,
        [Query.equal('post_id', postId), Query.equal('user_id', userId), Query.limit(1)]
      );

      return { liked: response.documents.length > 0, error: null };
    } catch (error: any) {
      console.error('Error checking like:', error);
      return { liked: false, error: new Error(error.message || 'Failed to check like') };
    }
  }

  async addLike(postId: string): Promise<{ error: Error | null }> {
    try {
      const user = await account.get();
      if (!user || !user.$id) {
        throw new Error('User not authenticated');
      }

      // Check if like already exists
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.POST_LIKES,
        [Query.equal('post_id', postId), Query.equal('user_id', user.$id), Query.limit(1)]
      );

      if (existing.documents.length > 0) {
        // Like already exists
        return { error: null };
      }

      // Create like
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.POST_LIKES,
        ID.unique(),
        {
          post_id: postId,
          user_id: user.$id,
        }
      );

      return { error: null };
    } catch (error: any) {
      console.error('Error adding like:', error);
      return { error: new Error(error.message || 'Failed to add like') };
    }
  }

  async removeLike(postId: string): Promise<{ error: Error | null }> {
    try {
      const user = await account.get();
      if (!user || !user.$id) {
        throw new Error('User not authenticated');
      }

      // Find like document
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.POST_LIKES,
        [Query.equal('post_id', postId), Query.equal('user_id', user.$id), Query.limit(1)]
      );

      if (existing.documents.length > 0) {
        // Delete like
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTIONS.POST_LIKES,
          existing.documents[0].$id
        );
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error removing like:', error);
      return { error: new Error(error.message || 'Failed to remove like') };
    }
  }
}

export const postLikesService = new PostLikesService();

