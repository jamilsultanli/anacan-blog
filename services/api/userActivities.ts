import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../appwrite';
import { UserActivity } from '../../types';

class UserActivitiesService {
  async logActivity(activity: Omit<UserActivity, 'id' | 'createdAt'>): Promise<{ error: Error | null }> {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USER_ACTIVITIES,
        ID.unique(),
        {
          user_id: activity.userId,
          type: activity.type,
          target_id: activity.targetId,
          target_type: activity.targetType,
          metadata: activity.metadata ? JSON.stringify(activity.metadata) : undefined,
        }
      );

      return { error: null };
    } catch (error: any) {
      console.error('Error logging activity:', error);
      return { error: new Error(error.message || 'Failed to log activity') };
    }
  }

  async getUserActivities(
    userId: string,
    limit: number = 20
  ): Promise<{ data: UserActivity[]; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USER_ACTIVITIES,
        [
          Query.equal('user_id', userId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
        ]
      );

      const activities: UserActivity[] = (response.documents || []).map((doc: any) => ({
        id: doc.$id,
        userId: doc.user_id,
        type: doc.type,
        targetId: doc.target_id,
        targetType: doc.target_type,
        metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined,
        createdAt: doc.$createdAt,
      }));

      return { data: activities, error: null };
    } catch (error: any) {
      console.error('Error getting user activities:', error);
      return { data: [], error: new Error(error.message || 'Failed to get user activities') };
    }
  }

  async getUserStats(userId: string): Promise<{
    data: {
      postsRead: number;
      commentsMade: number;
      bookmarksCount: number;
      followersCount: number;
      followingCount: number;
      likesReceived: number;
    };
    error: Error | null;
  }> {
    try {
      // Get posts read (from reading history)
      const readingHistory = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.READING_HISTORY,
        [Query.equal('user_id', userId)]
      );

      // Get comments made
      const comments = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.COMMENTS,
        [Query.equal('user_id', userId)]
      );

      // Get bookmarks
      const bookmarks = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.BOOKMARKS,
        [Query.equal('user_id', userId)]
      );

      // Get followers
      const followers = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FOLLOWS,
        [Query.equal('following_id', userId)]
      );

      // Get following
      const following = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FOLLOWS,
        [Query.equal('follower_id', userId)]
      );

      // Get likes received (count likes on user's posts)
      const userPosts = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.POSTS,
        [Query.equal('author_id', userId)]
      );

      const postIds = userPosts.documents.map((p: any) => p.$id);
      let likesReceived = 0;
      if (postIds.length > 0) {
        // Note: This is a simplified approach. For better performance, you might want to store likes count on posts
        const likes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.POST_LIKES,
          [Query.equal('post_id', postIds[0])] // This would need to be done per post or use a different approach
        );
        // For now, we'll use a placeholder
        likesReceived = 0; // Would need to aggregate all likes on user's posts
      }

      return {
        data: {
          postsRead: readingHistory.documents.length,
          commentsMade: comments.documents.length,
          bookmarksCount: bookmarks.documents.length,
          followersCount: followers.documents.length,
          followingCount: following.documents.length,
          likesReceived,
        },
        error: null,
      };
    } catch (error: any) {
      console.error('Error getting user stats:', error);
      return {
        data: {
          postsRead: 0,
          commentsMade: 0,
          bookmarksCount: 0,
          followersCount: 0,
          followingCount: 0,
          likesReceived: 0,
        },
        error: new Error(error.message || 'Failed to get user stats'),
      };
    }
  }
}

export const userActivitiesService = new UserActivitiesService();

