import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../appwrite';
import { Category } from '../../types';

class CategoriesService {
  async getCategories(): Promise<{ data: Category[]; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CATEGORIES,
        [Query.orderAsc('$createdAt')]
      );

      const categories: Category[] = (response.documents || []).map((cat: any) => ({
        id: cat.$id,
        slug: cat.slug,
        name: {
          az: cat.name_az,
          ru: cat.name_ru,
        },
        icon: cat.icon || '',
        color: cat.color || '',
      }));

      return { data: categories, error: null };
    } catch (error: any) {
      console.error('Error getting categories:', error);
      return { data: [], error: new Error(error.message || 'Failed to get categories') };
    }
  }

  async getCategoryBySlug(slug: string): Promise<{ data: Category | null; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CATEGORIES,
        [Query.equal('slug', slug), Query.limit(1)]
      );

      if (!response.documents || response.documents.length === 0) {
        return { data: null, error: null };
      }

      const data = response.documents[0];
      const category: Category = {
        id: data.$id,
        slug: data.slug,
        name: {
          az: data.name_az,
          ru: data.name_ru,
        },
        icon: data.icon || '',
        color: data.color || '',
      };

      return { data: category, error: null };
    } catch (error: any) {
      console.error('Error getting category by slug:', error);
      return { data: null, error: new Error(error.message || 'Failed to get category') };
    }
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<{ data: Category | null; error: Error | null }> {
    try {
      const created = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CATEGORIES,
        ID.unique(),
        {
          slug: category.slug,
          name_az: category.name.az,
          name_ru: category.name.ru,
          icon: category.icon,
          color: category.color,
        }
      );

      const newCategory: Category = {
        id: created.$id,
        slug: created.slug,
        name: {
          az: created.name_az,
          ru: created.name_ru,
        },
        icon: created.icon || '',
        color: created.color || '',
      };

      return { data: newCategory, error: null };
    } catch (error: any) {
      console.error('Error creating category:', error);
      return { data: null, error: new Error(error.message || 'Failed to create category') };
    }
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<{ data: Category | null; error: Error | null }> {
    try {
      const updateData: any = {};

      if (updates.slug) updateData.slug = updates.slug;
      if (updates.name) {
        updateData.name_az = updates.name.az;
        updateData.name_ru = updates.name.ru;
      }
      if (updates.icon !== undefined) updateData.icon = updates.icon;
      if (updates.color !== undefined) updateData.color = updates.color;

      const updated = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CATEGORIES,
        id,
        updateData
      );

      const category: Category = {
        id: updated.$id,
        slug: updated.slug,
        name: {
          az: updated.name_az,
          ru: updated.name_ru,
        },
        icon: updated.icon || '',
        color: updated.color || '',
      };

      return { data: category, error: null };
    } catch (error: any) {
      console.error('Error updating category:', error);
      return { data: null, error: new Error(error.message || 'Failed to update category') };
    }
  }

  async deleteCategory(id: string): Promise<{ error: Error | null }> {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.CATEGORIES, id);
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting category:', error);
      return { error: new Error(error.message || 'Failed to delete category') };
    }
  }
}

export const categoriesService = new CategoriesService();
