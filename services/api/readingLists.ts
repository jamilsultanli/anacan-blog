import { databases, DATABASE_ID, COLLECTIONS, ID, Query, account } from '../appwrite';

export interface ReadingList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  coverImageUrl?: string;
  postCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ReadingListItem {
  id: string;
  listId: string;
  postId: string;
  order?: number;
  createdAt: string;
}

class ReadingListsService {
  async getReadingLists(userId?: string): Promise<{ data: ReadingList[]; error: Error | null }> {
    try {
      const currentUser = await account.get();
      const targetUserId = userId || currentUser?.$id;
      
      if (!targetUserId) {
        return { data: [], error: null };
      }

      const queries = [Query.equal('user_id', targetUserId)];
      
      // If not own lists, only show public ones
      if (targetUserId !== currentUser?.$id) {
        queries.push(Query.equal('is_public', true));
      }

      queries.push(Query.orderDesc('$createdAt'));

      const response = await databases.listDocuments(
        DATABASE_ID,
        'reading_lists',
        queries
      );

      const lists: ReadingList[] = (response.documents || []).map((doc: any) => ({
        id: doc.$id,
        userId: doc.user_id,
        name: doc.name,
        description: doc.description,
        isPublic: doc.is_public !== false,
        coverImageUrl: doc.cover_image_url,
        postCount: doc.post_count || 0,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      }));

      return { data: lists, error: null };
    } catch (error: any) {
      console.error('Error getting reading lists:', error);
      return { data: [], error: new Error(error.message || 'Failed to get reading lists') };
    }
  }

  async createReadingList(list: Omit<ReadingList, 'id' | 'userId' | 'postCount' | 'createdAt' | 'updatedAt'>): Promise<{ data: ReadingList | null; error: Error | null }> {
    try {
      const currentUser = await account.get();
      if (!currentUser) throw new Error('User not authenticated');

      const created = await databases.createDocument(
        DATABASE_ID,
        'reading_lists',
        ID.unique(),
        {
          user_id: currentUser.$id,
          name: list.name,
          description: list.description,
          is_public: list.isPublic !== false,
          cover_image_url: list.coverImageUrl,
          post_count: 0,
        }
      );

      const readingList: ReadingList = {
        id: created.$id,
        userId: created.user_id,
        name: created.name,
        description: created.description,
        isPublic: created.is_public !== false,
        coverImageUrl: created.cover_image_url,
        postCount: 0,
        createdAt: created.$createdAt,
        updatedAt: created.$updatedAt,
      };

      return { data: readingList, error: null };
    } catch (error: any) {
      console.error('Error creating reading list:', error);
      return { data: null, error: new Error(error.message || 'Failed to create reading list') };
    }
  }

  async addPostToList(listId: string, postId: string): Promise<{ error: Error | null }> {
    try {
      // Check if already in list
      const existing = await databases.listDocuments(
        DATABASE_ID,
        'reading_list_items',
        [
          Query.equal('list_id', listId),
          Query.equal('post_id', postId),
          Query.limit(1)
        ]
      );

      if (existing.documents.length > 0) {
        return { error: null }; // Already in list
      }

      await databases.createDocument(
        DATABASE_ID,
        'reading_list_items',
        ID.unique(),
        {
          list_id: listId,
          post_id: postId,
        }
      );

      // Update post count
      const list = await databases.getDocument(DATABASE_ID, 'reading_lists', listId);
      await databases.updateDocument(
        DATABASE_ID,
        'reading_lists',
        listId,
        {
          post_count: (list.post_count || 0) + 1
        }
      );

      return { error: null };
    } catch (error: any) {
      console.error('Error adding post to list:', error);
      return { error: new Error(error.message || 'Failed to add post to list') };
    }
  }

  async removePostFromList(listId: string, postId: string): Promise<{ error: Error | null }> {
    try {
      const existing = await databases.listDocuments(
        DATABASE_ID,
        'reading_list_items',
        [
          Query.equal('list_id', listId),
          Query.equal('post_id', postId),
          Query.limit(1)
        ]
      );

      if (existing.documents.length > 0) {
        await databases.deleteDocument(
          DATABASE_ID,
          'reading_list_items',
          existing.documents[0].$id
        );

        // Update post count
        const list = await databases.getDocument(DATABASE_ID, 'reading_lists', listId);
        await databases.updateDocument(
          DATABASE_ID,
          'reading_lists',
          listId,
          {
            post_count: Math.max(0, (list.post_count || 0) - 1)
          }
        );
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error removing post from list:', error);
      return { error: new Error(error.message || 'Failed to remove post from list') };
    }
  }

  async getListPosts(listId: string): Promise<{ data: string[]; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'reading_list_items',
        [
          Query.equal('list_id', listId),
          Query.orderAsc('order'),
          Query.orderDesc('$createdAt')
        ]
      );

      const postIds = response.documents.map((doc: any) => doc.post_id);
      return { data: postIds, error: null };
    } catch (error: any) {
      console.error('Error getting list posts:', error);
      return { data: [], error: new Error(error.message || 'Failed to get list posts') };
    }
  }
}

export const readingListsService = new ReadingListsService();

