import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../appwrite';
import { Tag } from '../../types';

class TagsService {
  async getTags(): Promise<{ data: Tag[]; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TAGS,
        [Query.orderAsc('$createdAt')]
      );

      const tags: Tag[] = (response.documents || []).map((tag: any) => ({
        id: tag.$id,
        slug: tag.slug,
        name: {
          az: tag.name_az,
          ru: tag.name_ru,
        },
      }));

      return { data: tags, error: null };
    } catch (error: any) {
      console.error('Error getting tags:', error);
      return { data: [], error: new Error(error.message || 'Failed to get tags') };
    }
  }

  async getTagBySlug(slug: string): Promise<{ data: Tag | null; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TAGS,
        [Query.equal('slug', slug), Query.limit(1)]
      );

      if (!response.documents || response.documents.length === 0) {
        return { data: null, error: null };
      }

      const data = response.documents[0];
      const tag: Tag = {
        id: data.$id,
        slug: data.slug,
        name: {
          az: data.name_az,
          ru: data.name_ru,
        },
      };

      return { data: tag, error: null };
    } catch (error: any) {
      console.error('Error getting tag by slug:', error);
      return { data: null, error: new Error(error.message || 'Failed to get tag') };
    }
  }

  async createTag(tag: Omit<Tag, 'id'>): Promise<{ data: Tag | null; error: Error | null }> {
    try {
      const created = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TAGS,
        ID.unique(),
        {
          slug: tag.slug,
          name_az: tag.name.az,
          name_ru: tag.name.ru,
        }
      );

      const newTag: Tag = {
        id: created.$id,
        slug: created.slug,
        name: {
          az: created.name_az,
          ru: created.name_ru,
        },
      };

      return { data: newTag, error: null };
    } catch (error: any) {
      console.error('Error creating tag:', error);
      return { data: null, error: new Error(error.message || 'Failed to create tag') };
    }
  }

  async getPopularTags(limit = 10): Promise<{ data: Tag[]; error: Error | null }> {
    try {
      // Get all post_tags to count occurrences
      const postTagsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.POST_TAGS,
        [Query.limit(500)] // Adjust as needed
      );

      // Count tag occurrences
      const tagCounts = new Map<string, number>();
      postTagsResponse.documents.forEach((pt: any) => {
        const tagId = pt.tag_id;
        tagCounts.set(tagId, (tagCounts.get(tagId) || 0) + 1);
      });

      // Sort by count and get top tags
      const sortedTagIds = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([tagId]) => tagId);

      // Fetch tag details
      const tags: Tag[] = [];
      for (const tagId of sortedTagIds) {
        try {
          const tagDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.TAGS, tagId);
          tags.push({
            id: tagDoc.$id,
            slug: tagDoc.slug,
            name: {
              az: tagDoc.name_az,
              ru: tagDoc.name_ru,
            },
          });
        } catch (e) {
          // Tag not found, skip
        }
      }

      return { data: tags, error: null };
    } catch (error: any) {
      console.error('Error getting popular tags:', error);
      return { data: [], error: new Error(error.message || 'Failed to get popular tags') };
    }
  }
}

export const tagsService = new TagsService();
