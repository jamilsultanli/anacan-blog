import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../appwrite';

export interface Page {
  id: string;
  slug: string;
  title: {
    az: string;
    ru: string;
  };
  content: {
    az: string;
    ru: string;
  };
  metaTitle?: {
    az?: string;
    ru?: string;
  };
  metaDescription?: {
    az?: string;
    ru?: string;
  };
  isPublished: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

class PagesService {
  async getPages(published?: boolean): Promise<{ data: Page[]; error: Error | null }> {
    try {
      const queries: string[] = [];
      if (published !== undefined) {
        queries.push(Query.equal('is_published', published));
      }
      queries.push(Query.orderAsc('order'));

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PAGES,
        queries
      );

      const pages: Page[] = response.documents.map(doc => ({
        id: doc.$id,
        slug: doc.slug,
        title: {
          az: doc.title_az,
          ru: doc.title_ru,
        },
        content: {
          az: doc.content_az,
          ru: doc.content_ru,
        },
        metaTitle: doc.meta_title_az || doc.meta_title_ru ? {
          az: doc.meta_title_az,
          ru: doc.meta_title_ru,
        } : undefined,
        metaDescription: doc.meta_description_az || doc.meta_description_ru ? {
          az: doc.meta_description_az,
          ru: doc.meta_description_ru,
        } : undefined,
        isPublished: doc.is_published,
        order: doc.order,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      }));

      return { data: pages, error: null };
    } catch (error: any) {
      console.error('Error getting pages:', error);
      return { data: [], error: new Error(error.message || 'Failed to get pages') };
    }
  }

  async getPageBySlug(slug: string): Promise<{ data: Page | null; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PAGES,
        [Query.equal('slug', slug), Query.equal('is_published', true)]
      );

      if (response.documents.length === 0) {
        return { data: null, error: null };
      }

      const doc = response.documents[0];
      const page: Page = {
        id: doc.$id,
        slug: doc.slug,
        title: {
          az: doc.title_az,
          ru: doc.title_ru,
        },
        content: {
          az: doc.content_az,
          ru: doc.content_ru,
        },
        metaTitle: doc.meta_title_az || doc.meta_title_ru ? {
          az: doc.meta_title_az,
          ru: doc.meta_title_ru,
        } : undefined,
        metaDescription: doc.meta_description_az || doc.meta_description_ru ? {
          az: doc.meta_description_az,
          ru: doc.meta_description_ru,
        } : undefined,
        isPublished: doc.is_published,
        order: doc.order,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      };

      return { data: page, error: null };
    } catch (error: any) {
      console.error('Error getting page:', error);
      return { data: null, error: new Error(error.message || 'Failed to get page') };
    }
  }

  async createPage(page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Page | null; error: Error | null }> {
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PAGES,
        ID.unique(),
        {
          slug: page.slug,
          title_az: page.title.az,
          title_ru: page.title.ru,
          content_az: page.content.az,
          content_ru: page.content.ru,
          meta_title_az: page.metaTitle?.az || null,
          meta_title_ru: page.metaTitle?.ru || null,
          meta_description_az: page.metaDescription?.az || null,
          meta_description_ru: page.metaDescription?.ru || null,
          is_published: page.isPublished,
          order: page.order || 0,
        }
      );

      const createdPage: Page = {
        id: doc.$id,
        slug: doc.slug,
        title: {
          az: doc.title_az,
          ru: doc.title_ru,
        },
        content: {
          az: doc.content_az,
          ru: doc.content_ru,
        },
        metaTitle: doc.meta_title_az || doc.meta_title_ru ? {
          az: doc.meta_title_az,
          ru: doc.meta_title_ru,
        } : undefined,
        metaDescription: doc.meta_description_az || doc.meta_description_ru ? {
          az: doc.meta_description_az,
          ru: doc.meta_description_ru,
        } : undefined,
        isPublished: doc.is_published,
        order: doc.order,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      };

      return { data: createdPage, error: null };
    } catch (error: any) {
      console.error('Error creating page:', error);
      return { data: null, error: new Error(error.message || 'Failed to create page') };
    }
  }

  async updatePage(id: string, page: Partial<Page>): Promise<{ data: Page | null; error: Error | null }> {
    try {
      const updateData: any = {};
      if (page.slug !== undefined) updateData.slug = page.slug;
      if (page.title !== undefined) {
        updateData.title_az = page.title.az;
        updateData.title_ru = page.title.ru;
      }
      if (page.content !== undefined) {
        updateData.content_az = page.content.az;
        updateData.content_ru = page.content.ru;
      }
      if (page.metaTitle !== undefined) {
        updateData.meta_title_az = page.metaTitle.az || null;
        updateData.meta_title_ru = page.metaTitle.ru || null;
      }
      if (page.metaDescription !== undefined) {
        updateData.meta_description_az = page.metaDescription.az || null;
        updateData.meta_description_ru = page.metaDescription.ru || null;
      }
      if (page.isPublished !== undefined) updateData.is_published = page.isPublished;
      if (page.order !== undefined) updateData.order = page.order;

      const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.PAGES, id, updateData);

      const updatedPage: Page = {
        id: doc.$id,
        slug: doc.slug,
        title: {
          az: doc.title_az,
          ru: doc.title_ru,
        },
        content: {
          az: doc.content_az,
          ru: doc.content_ru,
        },
        metaTitle: doc.meta_title_az || doc.meta_title_ru ? {
          az: doc.meta_title_az,
          ru: doc.meta_title_ru,
        } : undefined,
        metaDescription: doc.meta_description_az || doc.meta_description_ru ? {
          az: doc.meta_description_az,
          ru: doc.meta_description_ru,
        } : undefined,
        isPublished: doc.is_published,
        order: doc.order,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      };

      return { data: updatedPage, error: null };
    } catch (error: any) {
      console.error('Error updating page:', error);
      return { data: null, error: new Error(error.message || 'Failed to update page') };
    }
  }

  async deletePage(id: string): Promise<{ error: Error | null }> {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PAGES, id);
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting page:', error);
      return { error: new Error(error.message || 'Failed to delete page') };
    }
  }
}

export const pagesService = new PagesService();

