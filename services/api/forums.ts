import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../appwrite';
import { Forum, ForumPost, ForumReply } from '../../types';

class ForumsService {
  async getForums(activeOnly: boolean = true): Promise<{ data: Forum[]; error: Error | null }> {
    try {
      const queries: any[] = [];
      if (activeOnly) {
        queries.push(Query.equal('is_active', true));
      }
      queries.push(Query.orderAsc('order'));
      queries.push(Query.orderAsc('$createdAt'));

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FORUMS,
        queries
      );

      const forums: Forum[] = await Promise.all(
        (response.documents || []).map(async (doc: any) => {
          // Get post count for this forum
          let postCount = 0;
          try {
            const postsResponse = await databases.listDocuments(
              DATABASE_ID,
              COLLECTIONS.FORUM_POSTS,
              [Query.equal('forum_id', doc.$id)]
            );
            postCount = postsResponse.documents.length;
          } catch (e) {
            // Count failed, use stored value
            postCount = doc.post_count || 0;
          }

          return {
            id: doc.$id,
            name: {
              az: doc.name_az,
              ru: doc.name_ru,
            },
            slug: doc.slug,
            description: doc.description_az || doc.description_ru
              ? {
                  az: doc.description_az || '',
                  ru: doc.description_ru || '',
                }
              : undefined,
            icon: doc.icon,
            color: doc.color,
            isActive: doc.is_active !== false,
            order: doc.order,
            postCount,
            createdAt: doc.$createdAt,
            updatedAt: doc.$updatedAt,
          };
        })
      );

      return { data: forums, error: null };
    } catch (error: any) {
      console.error('Error getting forums:', error);
      return { data: [], error: new Error(error.message || 'Failed to get forums') };
    }
  }

  async getForumBySlug(slug: string): Promise<{ data: Forum | null; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FORUMS,
        [
          Query.equal('slug', slug),
          Query.limit(1),
        ]
      );

      if (response.documents.length === 0) {
        return { data: null, error: null };
      }

      const doc = response.documents[0];
      const forum: Forum = {
        id: doc.$id,
        name: {
          az: doc.name_az,
          ru: doc.name_ru,
        },
        slug: doc.slug,
        description: doc.description_az || doc.description_ru
          ? {
              az: doc.description_az || '',
              ru: doc.description_ru || '',
            }
          : undefined,
        icon: doc.icon,
        color: doc.color,
        isActive: doc.is_active !== false,
        order: doc.order,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      };

      return { data: forum, error: null };
    } catch (error: any) {
      console.error('Error getting forum:', error);
      return { data: null, error: new Error(error.message || 'Failed to get forum') };
    }
  }

  async getForumPosts(
    forumId: string,
    limit: number = 20
  ): Promise<{ data: ForumPost[]; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        [
          Query.equal('forum_id', forumId),
          Query.orderDesc('is_pinned'),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
        ]
      );

      const posts: ForumPost[] = (response.documents || []).map((doc: any) => ({
        id: doc.$id,
        forumId: doc.forum_id,
        userId: doc.user_id,
        title: doc.title,
        content: doc.content,
        isPinned: doc.is_pinned || false,
        isSolved: doc.is_solved || false,
        isClosed: doc.is_closed || false,
        viewCount: doc.view_count || 0,
        upvoteCount: doc.upvote_count || 0,
        downvoteCount: doc.downvote_count || 0,
        replyCount: doc.reply_count || 0,
        lastReplyAt: doc.last_reply_at,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      }));

      return { data: posts, error: null };
    } catch (error: any) {
      console.error('Error getting forum posts:', error);
      return { data: [], error: new Error(error.message || 'Failed to get forum posts') };
    }
  }

  async createForumPost(
    forumId: string,
    post: Omit<ForumPost, 'id' | 'forumId' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<{ data: ForumPost | null; error: Error | null }> {
    try {
      const { account } = await import('../appwrite');
      const currentUser = await account.get();
      if (!currentUser) throw new Error('User not authenticated');

      const created = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        ID.unique(),
        {
          forum_id: forumId,
          user_id: currentUser.$id,
          title: post.title,
          content: post.content,
          is_pinned: false,
          is_solved: false,
          view_count: 0,
          upvote_count: 0,
          downvote_count: 0,
          reply_count: 0,
        }
      );

      const forumPost: ForumPost = {
        id: created.$id,
        forumId: created.forum_id,
        userId: created.user_id,
        title: created.title,
        content: created.content,
        isPinned: created.is_pinned || false,
        isSolved: created.is_solved || false,
        isClosed: created.is_closed || false,
        viewCount: created.view_count || 0,
        upvoteCount: created.upvote_count || 0,
        downvoteCount: created.downvote_count || 0,
        replyCount: created.reply_count || 0,
        createdAt: created.$createdAt,
        updatedAt: created.$updatedAt,
      };

      // Update forum post count
      try {
        const forum = await databases.getDocument(DATABASE_ID, COLLECTIONS.FORUMS, forumId);
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.FORUMS,
          forumId,
          { post_count: (forum.post_count || 0) + 1 }
        );
      } catch (e) {
        // Forum update failed, continue
      }

      return { data: forumPost, error: null };
    } catch (error: any) {
      console.error('Error creating forum post:', error);
      return { data: null, error: new Error(error.message || 'Failed to create forum post') };
    }
  }

  async getForumReplies(forumPostId: string): Promise<{ data: ForumReply[]; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FORUM_REPLIES,
        [
          Query.equal('forum_post_id', forumPostId),
          Query.orderAsc('$createdAt'),
        ]
      );

      const replies: ForumReply[] = (response.documents || []).map((doc: any) => ({
        id: doc.$id,
        forumPostId: doc.forum_post_id,
        userId: doc.user_id,
        content: doc.content,
        isHelpful: doc.is_helpful || false,
        upvoteCount: doc.upvote_count || 0,
        parentReplyId: doc.parent_reply_id || undefined,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      }));

      // Build nested structure
      const replyMap = new Map<string, ForumReply>();
      const rootReplies: ForumReply[] = [];

      // First pass: create map
      replies.forEach(reply => {
        replyMap.set(reply.id, { ...reply, replies: [] });
      });

      // Second pass: build tree
      replies.forEach(reply => {
        const replyNode = replyMap.get(reply.id)!;
        if (reply.parentReplyId && replyMap.has(reply.parentReplyId)) {
          const parent = replyMap.get(reply.parentReplyId)!;
          if (!parent.replies) parent.replies = [];
          parent.replies.push(replyNode);
        } else {
          rootReplies.push(replyNode);
        }
      });

      return { data: rootReplies, error: null };
    } catch (error: any) {
      console.error('Error getting forum replies:', error);
      return { data: [], error: new Error(error.message || 'Failed to get forum replies') };
    }
  }

  async createForumReply(
    forumPostId: string,
    content: string,
    parentReplyId?: string
  ): Promise<{ data: ForumReply | null; error: Error | null }> {
    try {
      const { account } = await import('../appwrite');
      const currentUser = await account.get();
      if (!currentUser) throw new Error('User not authenticated');

      const replyData: any = {
        forum_post_id: forumPostId,
        user_id: currentUser.$id,
        content: content,
        is_helpful: false,
        upvote_count: 0,
      };

      // Add parent_reply_id if it's a nested reply
      if (parentReplyId) {
        replyData.parent_reply_id = parentReplyId;
      }

      const created = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_REPLIES,
        ID.unique(),
        replyData
      );

      // Update reply count on post
      try {
        const post = await databases.getDocument(DATABASE_ID, COLLECTIONS.FORUM_POSTS, forumPostId);
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.FORUM_POSTS,
          forumPostId,
          {
            reply_count: (post.reply_count || 0) + 1,
            last_reply_at: new Date().toISOString(),
          }
        );
      } catch (e) {
        // Post update failed, continue
      }

      const reply: ForumReply = {
        id: created.$id,
        forumPostId: created.forum_post_id,
        userId: created.user_id,
        content: created.content,
        isHelpful: created.is_helpful || false,
        upvoteCount: created.upvote_count || 0,
        createdAt: created.$createdAt,
        updatedAt: created.$updatedAt,
      };

      return { data: reply, error: null };
    } catch (error: any) {
      console.error('Error creating forum reply:', error);
      return { data: null, error: new Error(error.message || 'Failed to create forum reply') };
    }
  }

  async upvoteForumReply(replyId: string): Promise<{ data: boolean; error: Error | null }> {
    try {
      const { account } = await import('../appwrite');
      const currentUser = await account.get();
      if (!currentUser) throw new Error('User not authenticated');

      // Check if user already voted
      const { Query } = await import('../appwrite');
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FORUM_VOTES,
        [
          Query.equal('forum_post_id', replyId),
          Query.equal('user_id', currentUser.$id),
          Query.limit(1),
        ]
      );

      if (existing.documents.length > 0) {
        return { data: false, error: null }; // Already voted
      }

      // Create vote
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_VOTES,
        ID.unique(),
        {
          forum_post_id: replyId,
          user_id: currentUser.$id,
          vote_type: 'upvote',
        }
      );

      // Update reply upvote count
      const reply = await databases.getDocument(DATABASE_ID, COLLECTIONS.FORUM_REPLIES, replyId);
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_REPLIES,
        replyId,
        { upvote_count: (reply.upvote_count || 0) + 1 }
      );

      return { data: true, error: null };
    } catch (error: any) {
      console.error('Error upvoting reply:', error);
      return { data: false, error: new Error(error.message || 'Failed to upvote reply') };
    }
  }

  async checkUserVotedReply(replyId: string): Promise<{ data: boolean; error: Error | null }> {
    try {
      const { account } = await import('../appwrite');
      const currentUser = await account.get();
      if (!currentUser) return { data: false, error: null };

      const { Query } = await import('../appwrite');
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FORUM_VOTES,
        [
          Query.equal('forum_post_id', replyId),
          Query.equal('user_id', currentUser.$id),
          Query.limit(1),
        ]
      );

      return { data: existing.documents.length > 0, error: null };
    } catch (error: any) {
      return { data: false, error: null };
    }
  }

  async upvoteForumPost(postId: string): Promise<{ data: boolean; error: Error | null }> {
    try {
      const { account } = await import('../appwrite');
      const currentUser = await account.get();
      if (!currentUser) throw new Error('User not authenticated');

      // Check if user already voted
      const { Query } = await import('../appwrite');
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FORUM_VOTES,
        [
          Query.equal('forum_post_id', postId),
          Query.equal('user_id', currentUser.$id),
          Query.limit(1),
        ]
      );

      if (existing.documents.length > 0) {
        return { data: false, error: null }; // Already voted
      }

      // Create vote
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_VOTES,
        ID.unique(),
        {
          forum_post_id: postId,
          user_id: currentUser.$id,
          vote_type: 'upvote',
        }
      );

      // Update post upvote count
      const post = await databases.getDocument(DATABASE_ID, COLLECTIONS.FORUM_POSTS, postId);
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        postId,
        { upvote_count: (post.upvote_count || 0) + 1 }
      );

      return { data: true, error: null };
    } catch (error: any) {
      console.error('Error upvoting post:', error);
      return { data: false, error: new Error(error.message || 'Failed to upvote post') };
    }
  }

  async checkUserVotedPost(postId: string): Promise<{ data: boolean; error: Error | null }> {
    try {
      const { account } = await import('../appwrite');
      const currentUser = await account.get();
      if (!currentUser) return { data: false, error: null };

      const { Query } = await import('../appwrite');
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FORUM_VOTES,
        [
          Query.equal('forum_post_id', postId),
          Query.equal('user_id', currentUser.$id),
          Query.limit(1),
        ]
      );

      return { data: existing.documents.length > 0, error: null };
    } catch (error: any) {
      return { data: false, error: null };
    }
  }

  async updateForumReply(replyId: string, content: string): Promise<{ data: ForumReply | null; error: Error | null }> {
    try {
      const { account } = await import('../appwrite');
      const currentUser = await account.get();
      if (!currentUser) throw new Error('User not authenticated');

      // Get reply to verify ownership or admin status
      const reply = await databases.getDocument(DATABASE_ID, COLLECTIONS.FORUM_REPLIES, replyId);
      
      // Check if user is admin (get user profile to check role)
      const { usersService } = await import('./users');
      const userProfile = await usersService.getUserProfile(currentUser.$id);
      const isAdmin = userProfile.data?.role === 'admin' || userProfile.data?.role === 'author';
      
      if (reply.user_id !== currentUser.$id && !isAdmin) {
        throw new Error('Unauthorized: You can only edit your own replies');
      }

      // Update reply
      const updated = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_REPLIES,
        replyId,
        { content: content }
      );

      const forumReply: ForumReply = {
        id: updated.$id,
        forumPostId: updated.forum_post_id,
        userId: updated.user_id,
        content: updated.content,
        isHelpful: updated.is_helpful || false,
        upvoteCount: updated.upvote_count || 0,
        parentReplyId: updated.parent_reply_id || undefined,
        createdAt: updated.$createdAt,
        updatedAt: updated.$updatedAt,
      };

      return { data: forumReply, error: null };
    } catch (error: any) {
      console.error('Error updating forum reply:', error);
      return { data: null, error: new Error(error.message || 'Failed to update forum reply') };
    }
  }

  async closeForumPost(postId: string): Promise<{ data: ForumPost | null; error: Error | null }> {
    try {
      const { account } = await import('../appwrite');
      const currentUser = await account.get();
      if (!currentUser) throw new Error('User not authenticated');

      // Get post to verify ownership
      const post = await databases.getDocument(DATABASE_ID, COLLECTIONS.FORUM_POSTS, postId);
      if (post.user_id !== currentUser.$id) {
        throw new Error('Unauthorized: You can only close your own posts');
      }

      // Update post
      const updated = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        postId,
        { is_closed: true }
      );

      const forumPost: ForumPost = {
        id: updated.$id,
        forumId: updated.forum_id,
        userId: updated.user_id,
        title: updated.title,
        content: updated.content,
        isPinned: updated.is_pinned || false,
        isSolved: updated.is_solved || false,
        isClosed: updated.is_closed || false,
        viewCount: updated.view_count || 0,
        upvoteCount: updated.upvote_count || 0,
        downvoteCount: updated.downvote_count || 0,
        replyCount: updated.reply_count || 0,
        lastReplyAt: updated.last_reply_at,
        createdAt: updated.$createdAt,
        updatedAt: updated.$updatedAt,
      };

      return { data: forumPost, error: null };
    } catch (error: any) {
      console.error('Error closing forum post:', error);
      return { data: null, error: new Error(error.message || 'Failed to close forum post') };
    }
  }

  async deleteForumReply(replyId: string): Promise<{ error: Error | null }> {
    try {
      const { account } = await import('../appwrite');
      const currentUser = await account.get();
      if (!currentUser) throw new Error('User not authenticated');

      // Get reply to verify ownership or admin status
      const reply = await databases.getDocument(DATABASE_ID, COLLECTIONS.FORUM_REPLIES, replyId);
      
      // Check if user is admin (get user profile to check role)
      const { usersService } = await import('./users');
      const userProfile = await usersService.getUserProfile(currentUser.$id);
      const isAdmin = userProfile.data?.role === 'admin' || userProfile.data?.role === 'author';
      
      if (reply.user_id !== currentUser.$id && !isAdmin) {
        throw new Error('Unauthorized: You can only delete your own replies');
      }

      // Delete reply
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.FORUM_REPLIES, replyId);

      // Update reply count on post
      try {
        const post = await databases.getDocument(DATABASE_ID, COLLECTIONS.FORUM_POSTS, reply.forum_post_id);
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.FORUM_POSTS,
          reply.forum_post_id,
          {
            reply_count: Math.max(0, (post.reply_count || 0) - 1),
          }
        );
      } catch (e) {
        // Post update failed, continue
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error deleting forum reply:', error);
      return { error: new Error(error.message || 'Failed to delete forum reply') };
    }
  }
}

export const forumsService = new ForumsService();

