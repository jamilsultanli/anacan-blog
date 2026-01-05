import { databases, DATABASE_ID, COLLECTIONS, ID, Query, account } from '../appwrite';
import { Permission, Role } from 'appwrite';
import { Follow } from '../../types';

class FollowsService {
  async followUser(followingId: string): Promise<{ error: Error | null }> {
    try {
      const currentUser = await account.get();
      if (!currentUser) throw new Error('User not authenticated');

      // Check if already following
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FOLLOWS,
        [
          Query.equal('follower_id', currentUser.$id),
          Query.equal('following_id', followingId),
          Query.limit(1)
        ]
      );

      if (existing.documents.length > 0) {
        return { error: null }; // Already following
      }

      // Create follow relationship
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.FOLLOWS,
        ID.unique(),
        {
          follower_id: currentUser.$id,
          following_id: followingId,
        },
        [
          Permission.read(Role.any()),
          Permission.write(Role.users()),
          Permission.delete(Role.users()),
        ]
      );

      return { error: null };
    } catch (error: any) {
      console.error('Error following user:', error);
      return { error: new Error(error.message || 'Failed to follow user') };
    }
  }

  async unfollowUser(followingId: string): Promise<{ error: Error | null }> {
    try {
      const currentUser = await account.get();
      if (!currentUser) throw new Error('User not authenticated');

      // Find follow relationship
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FOLLOWS,
        [
          Query.equal('follower_id', currentUser.$id),
          Query.equal('following_id', followingId),
          Query.limit(1)
        ]
      );

      if (existing.documents.length > 0) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTIONS.FOLLOWS,
          existing.documents[0].$id
        );
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      return { error: new Error(error.message || 'Failed to unfollow user') };
    }
  }

  async checkIsFollowing(followerId: string, followingId: string): Promise<{ isFollowing: boolean; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FOLLOWS,
        [
          Query.equal('follower_id', followerId),
          Query.equal('following_id', followingId),
          Query.limit(1)
        ]
      );

      return { isFollowing: response.documents.length > 0, error: null };
    } catch (error: any) {
      console.error('Error checking follow status:', error);
      return { isFollowing: false, error: new Error(error.message || 'Failed to check follow status') };
    }
  }

  async getFollowers(userId: string): Promise<{ data: Follow[]; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FOLLOWS,
        [
          Query.equal('following_id', userId),
          Query.orderDesc('$createdAt')
        ]
      );

      const follows: Follow[] = (response.documents || []).map((doc: any) => ({
        id: doc.$id,
        followerId: doc.follower_id,
        followingId: doc.following_id,
        createdAt: doc.$createdAt,
      }));

      return { data: follows, error: null };
    } catch (error: any) {
      console.error('Error getting followers:', error);
      return { data: [], error: new Error(error.message || 'Failed to get followers') };
    }
  }

  async getFollowing(userId: string): Promise<{ data: Follow[]; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FOLLOWS,
        [
          Query.equal('follower_id', userId),
          Query.orderDesc('$createdAt')
        ]
      );

      const follows: Follow[] = (response.documents || []).map((doc: any) => ({
        id: doc.$id,
        followerId: doc.follower_id,
        followingId: doc.following_id,
        createdAt: doc.$createdAt,
      }));

      return { data: follows, error: null };
    } catch (error: any) {
      console.error('Error getting following:', error);
      return { data: [], error: new Error(error.message || 'Failed to get following') };
    }
  }

  async getFollowCounts(userId: string): Promise<{ followers: number; following: number; error: Error | null }> {
    try {
      const [followersRes, followingRes] = await Promise.all([
        databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.FOLLOWS,
          [Query.equal('following_id', userId)]
        ),
        databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.FOLLOWS,
          [Query.equal('follower_id', userId)]
        ),
      ]);

      return {
        followers: followersRes.documents.length,
        following: followingRes.documents.length,
        error: null,
      };
    } catch (error: any) {
      console.error('Error getting follow counts:', error);
      return { followers: 0, following: 0, error: new Error(error.message || 'Failed to get follow counts') };
    }
  }
}

export const followsService = new FollowsService();

