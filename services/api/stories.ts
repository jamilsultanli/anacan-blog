import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../appwrite';
import { Story } from '../../types';

class StoriesService {
  async getStories(activeOnly: boolean = true): Promise<{ data: Story[]; error: Error | null }> {
    try {
      const queries: string[] = [];
      if (activeOnly) {
        queries.push(Query.equal('is_active', true));
      }
      // Use createdAt ordering (order attribute might not exist yet)
      queries.push(Query.orderDesc('$createdAt'));
      queries.push(Query.limit(20));

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.STORIES,
        queries
      );

      const stories: Story[] = response.documents.map(doc => ({
        id: doc.$id,
        title: {
          az: doc.title_az,
          ru: doc.title_ru,
        },
        imageUrl: doc.image_url,
        linkUrl: doc.link_url,
        linkText: doc.link_text_az || doc.link_text_ru ? {
          az: doc.link_text_az,
          ru: doc.link_text_ru,
        } : undefined,
        isActive: doc.is_active !== undefined ? doc.is_active : true,
        order: doc.order !== undefined ? doc.order : 0,
        expiresAt: doc.expires_at,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      }));

      // Filter out expired stories and sort by order if available
      const now = new Date();
      const validStories = stories
        .filter(story => {
          if (!story.expiresAt) return true;
          return new Date(story.expiresAt) > now;
        })
        .sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order if available

      return { data: validStories, error: null };
    } catch (error: any) {
      console.error('Error getting stories:', error);
      return { data: [], error: new Error(error.message || 'Failed to get stories') };
    }
  }

  async getStoryById(id: string): Promise<{ data: Story | null; error: Error | null }> {
    try {
      const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.STORIES, id);

      const story: Story = {
        id: doc.$id,
        title: {
          az: doc.title_az,
          ru: doc.title_ru,
        },
        imageUrl: doc.image_url,
        linkUrl: doc.link_url,
        linkText: doc.link_text_az || doc.link_text_ru ? {
          az: doc.link_text_az,
          ru: doc.link_text_ru,
        } : undefined,
        isActive: doc.is_active !== undefined ? doc.is_active : true,
        order: doc.order !== undefined ? doc.order : 0,
        expiresAt: doc.expires_at,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      };

      return { data: story, error: null };
    } catch (error: any) {
      console.error('Error getting story:', error);
      return { data: null, error: new Error(error.message || 'Failed to get story') };
    }
  }

  async createStory(story: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Story | null; error: Error | null }> {
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.STORIES,
        ID.unique(),
        {
          title_az: story.title?.az || null,
          title_ru: story.title?.ru || null,
          image_url: story.imageUrl,
          link_url: story.linkUrl || null,
          link_text_az: story.linkText?.az || null,
          link_text_ru: story.linkText?.ru || null,
          is_active: story.isActive,
          order: story.order || 0,
          expires_at: story.expiresAt || null,
        }
      );

      const createdStory: Story = {
        id: doc.$id,
        title: {
          az: doc.title_az,
          ru: doc.title_ru,
        },
        imageUrl: doc.image_url,
        linkUrl: doc.link_url,
        linkText: doc.link_text_az || doc.link_text_ru ? {
          az: doc.link_text_az,
          ru: doc.link_text_ru,
        } : undefined,
        isActive: doc.is_active !== undefined ? doc.is_active : true,
        order: doc.order !== undefined ? doc.order : 0,
        expiresAt: doc.expires_at,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      };

      return { data: createdStory, error: null };
    } catch (error: any) {
      console.error('Error creating story:', error);
      return { data: null, error: new Error(error.message || 'Failed to create story') };
    }
  }

  async updateStory(id: string, story: Partial<Story>): Promise<{ data: Story | null; error: Error | null }> {
    try {
      const updateData: any = {};
      if (story.title !== undefined) {
        updateData.title_az = story.title.az || null;
        updateData.title_ru = story.title.ru || null;
      }
      if (story.imageUrl !== undefined) updateData.image_url = story.imageUrl;
      if (story.linkUrl !== undefined) updateData.link_url = story.linkUrl || null;
      if (story.linkText !== undefined) {
        updateData.link_text_az = story.linkText.az || null;
        updateData.link_text_ru = story.linkText.ru || null;
      }
      if (story.isActive !== undefined) updateData.is_active = story.isActive;
      if (story.order !== undefined) updateData.order = story.order;
      if (story.expiresAt !== undefined) updateData.expires_at = story.expiresAt || null;

      const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.STORIES, id, updateData);

      const updatedStory: Story = {
        id: doc.$id,
        title: {
          az: doc.title_az,
          ru: doc.title_ru,
        },
        imageUrl: doc.image_url,
        linkUrl: doc.link_url,
        linkText: doc.link_text_az || doc.link_text_ru ? {
          az: doc.link_text_az,
          ru: doc.link_text_ru,
        } : undefined,
        isActive: doc.is_active !== undefined ? doc.is_active : true,
        order: doc.order !== undefined ? doc.order : 0,
        expiresAt: doc.expires_at,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      };

      return { data: updatedStory, error: null };
    } catch (error: any) {
      console.error('Error updating story:', error);
      return { data: null, error: new Error(error.message || 'Failed to update story') };
    }
  }

  async deleteStory(id: string): Promise<{ error: Error | null }> {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.STORIES, id);
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting story:', error);
      return { error: new Error(error.message || 'Failed to delete story') };
    }
  }
}

export const storiesService = new StoriesService();

