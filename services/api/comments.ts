import { databases, DATABASE_ID, COLLECTIONS, ID, Query, account } from '../appwrite';
import { Comment, CommentReaction } from '../../types';

class CommentsService {
  async getCommentsByPost(postId: string): Promise<{ data: Comment[]; error: Error | null }> {
    try {
      // Fetch comments for post
      const commentsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.COMMENTS,
        [
          Query.equal('post_id', postId),
          Query.equal('is_approved', true),
          Query.orderAsc('$createdAt')
        ]
      );

      const commentsData = commentsResponse.documents || [];

      // Get unique user IDs
      const userIds = [...new Set(commentsData.map((c: any) => c.user_id).filter(Boolean))];
      
      // Fetch user profiles
      const profilesMap = new Map();
      if (userIds.length > 0) {
        try {
          // Appwrite doesn't support IN queries directly, so fetch individually or use array
          // For now, we'll fetch them individually if needed, but better to store user data in comment
          // For simplicity, we'll try to get all profiles (if collection allows)
          const profilesResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USER_PROFILES,
            [Query.limit(100)] // Get all profiles (you might want to optimize this)
          );
          profilesResponse.documents.forEach((p: any) => {
            if (userIds.includes(p.$id)) {
              profilesMap.set(p.$id, p);
            }
          });
        } catch (e) {
          // Profiles fetch failed, continue without them
        }
      }

      // Get reactions for all comments
      const commentIds = commentsData.map((c: any) => c.$id);
      const reactionsMap = new Map();
      if (commentIds.length > 0) {
        try {
          // Fetch reactions for these comments
          const reactionsResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.COMMENT_REACTIONS,
            [Query.limit(500)] // Adjust limit as needed
          );
          reactionsResponse.documents.forEach((r: any) => {
            if (commentIds.includes(r.comment_id)) {
              if (!reactionsMap.has(r.comment_id)) {
                reactionsMap.set(r.comment_id, []);
              }
              reactionsMap.get(r.comment_id).push(r);
            }
          });
        } catch (e) {
          // Reactions fetch failed
        }
      }

      // Build nested structure
      const commentsMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      // Get account info for users without profiles
      const accountMap = new Map();
      for (const userId of userIds) {
        if (!profilesMap.has(userId)) {
          try {
            // Try to get account info (this might fail if not current user)
            // We'll handle this gracefully
          } catch (e) {
            // Can't get account info
          }
        }
      }

      commentsData.forEach((comment: any) => {
        const userProfile = profilesMap.get(comment.user_id);
        const reactions = reactionsMap.get(comment.$id) || [];

        // Use profile if available, otherwise create a basic user object (never undefined)
        const commentData: Comment = {
          id: comment.$id,
          postId: comment.post_id,
          userId: comment.user_id,
          user: userProfile ? {
            id: userProfile.$id,
            username: userProfile.username,
            fullName: userProfile.full_name,
            avatarUrl: userProfile.avatar_url,
            role: userProfile.role || 'user',
          } : {
            id: comment.user_id,
            username: 'user',
            fullName: 'İstifadəçi',
            avatarUrl: undefined,
            role: 'user' as const,
          },
          parentId: comment.parent_id || undefined,
          content: comment.content,
          isApproved: comment.is_approved,
          createdAt: comment.$createdAt ? new Date(comment.$createdAt).toISOString() : undefined,
          updatedAt: comment.$updatedAt ? new Date(comment.$updatedAt).toISOString() : undefined,
          replies: [],
          reactions: reactions.map((r: any) => ({
            id: r.$id,
            commentId: r.comment_id,
            userId: r.user_id,
            reactionType: r.reaction_type,
          })),
        };

        commentsMap.set(comment.$id, commentData);

        if (!comment.parent_id) {
          rootComments.push(commentData);
        } else {
          const parent = commentsMap.get(comment.parent_id);
          if (parent) {
            if (!parent.replies) parent.replies = [];
            parent.replies.push(commentData);
          }
        }
      });

      return { data: rootComments, error: null };
    } catch (error: any) {
      console.error('Error getting comments:', error);
      return { data: [], error: new Error(error.message || 'Failed to get comments') };
    }
  }

  async createComment(
    postId: string,
    content: string,
    parentId?: string
  ): Promise<{ data: Comment | null; error: Error | null }> {
    try {
      const user = await account.get();
      if (!user) throw new Error('User not authenticated');

      const created = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.COMMENTS,
        ID.unique(),
        {
          post_id: postId,
          user_id: user.$id,
          parent_id: parentId || null,
          content,
          is_approved: true,
        }
      );

      // Fetch user profile
      let userProfile = null;
      try {
        userProfile = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.USER_PROFILES,
          user.$id
        );
      } catch (e) {
        // Profile doesn't exist, use account info as fallback
      }

      // Use account info if profile doesn't exist
      const userName = userProfile?.full_name || userProfile?.username || user.name || user.email?.split('@')[0] || 'İstifadəçi';
      const userEmail = user.email || '';

      const comment: Comment = {
        id: created.$id,
        postId: created.post_id,
        userId: created.user_id,
        user: userProfile ? {
          id: userProfile.$id,
          username: userProfile.username,
          fullName: userProfile.full_name,
          avatarUrl: userProfile.avatar_url,
          role: userProfile.role || 'user',
        } : {
          id: user.$id,
          username: user.email?.split('@')[0] || 'user',
          fullName: user.name || user.email?.split('@')[0] || 'İstifadəçi',
          avatarUrl: undefined,
          role: 'user' as const,
        },
        parentId: created.parent_id || undefined,
        content: created.content,
        isApproved: created.is_approved,
        createdAt: created.$createdAt ? new Date(created.$createdAt).toISOString() : undefined,
        updatedAt: created.$updatedAt ? new Date(created.$updatedAt).toISOString() : undefined,
        replies: [],
        reactions: [],
      };

      return { data: comment, error: null };
    } catch (error: any) {
      console.error('Error creating comment:', error);
      return { data: null, error: new Error(error.message || 'Failed to create comment') };
    }
  }

  async updateComment(id: string, content: string): Promise<{ data: Comment | null; error: Error | null }> {
    try {
      const updated = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.COMMENTS,
        id,
        { content }
      );

      const comment: Comment = {
        id: updated.$id,
        postId: updated.post_id,
        userId: updated.user_id,
        parentId: updated.parent_id || undefined,
        content: updated.content,
        isApproved: updated.is_approved,
        createdAt: updated.$createdAt ? new Date(updated.$createdAt).toISOString() : undefined,
        updatedAt: updated.$updatedAt ? new Date(updated.$updatedAt).toISOString() : undefined,
      };

      return { data: comment, error: null };
    } catch (error: any) {
      console.error('Error updating comment:', error);
      return { data: null, error: new Error(error.message || 'Failed to update comment') };
    }
  }

  async deleteComment(id: string): Promise<{ error: Error | null }> {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.COMMENTS, id);
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      return { error: new Error(error.message || 'Failed to delete comment') };
    }
  }

  async addReaction(
    commentId: string,
    reactionType: 'like' | 'love' | 'helpful' | 'laugh' | 'wow' | 'sad' | 'angry'
  ): Promise<{ data: CommentReaction | null; error: Error | null }> {
    try {
      const user = await account.get();
      if (!user) throw new Error('User not authenticated');

      // Check if reaction already exists
      try {
        const existing = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.COMMENT_REACTIONS,
          [
            Query.equal('comment_id', commentId),
            Query.equal('user_id', user.$id),
            Query.equal('reaction_type', reactionType),
            Query.limit(1)
          ]
        );

        if (existing.documents.length > 0) {
          // Reaction already exists
          const existingReaction = existing.documents[0];
          return {
            data: {
              id: existingReaction.$id,
              commentId: existingReaction.comment_id,
              userId: existingReaction.user_id,
              reactionType: existingReaction.reaction_type,
            },
            error: null
          };
        }
      } catch (e) {
        // No existing reaction, continue
      }

      const created = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.COMMENT_REACTIONS,
        ID.unique(),
        {
          comment_id: commentId,
          user_id: user.$id,
          reaction_type: reactionType,
        }
      );

      const reaction: CommentReaction = {
        id: created.$id,
        commentId: created.comment_id,
        userId: created.user_id,
        reactionType: created.reaction_type,
      };

      return { data: reaction, error: null };
    } catch (error: any) {
      console.error('Error adding reaction:', error);
      return { data: null, error: new Error(error.message || 'Failed to add reaction') };
    }
  }

  async removeReaction(commentId: string, reactionType: 'like' | 'love' | 'helpful' | 'laugh' | 'wow' | 'sad' | 'angry'): Promise<{ error: Error | null }> {
    try {
      const user = await account.get();
      if (!user) throw new Error('User not authenticated');

      // Find the reaction
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.COMMENT_REACTIONS,
        [
          Query.equal('comment_id', commentId),
          Query.equal('user_id', user.$id),
          Query.equal('reaction_type', reactionType),
          Query.limit(1)
        ]
      );

      if (response.documents.length > 0) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTIONS.COMMENT_REACTIONS,
          response.documents[0].$id
        );
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error removing reaction:', error);
      return { error: new Error(error.message || 'Failed to remove reaction') };
    }
  }
}

export const commentsService = new CommentsService();
