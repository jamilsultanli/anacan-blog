import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from './appwrite';

interface Translation {
  id: string;
  key: string;
  namespace: string;
  value_az: string;
  value_ru: string;
  description?: string;
}

interface SiteSetting {
  id: string;
  key: string;
  value_az?: string;
  value_ru?: string;
  value_json?: any;
  setting_type: string;
}

class TranslationService {
  private cache: Map<string, { translations: Record<string, string>; timestamp: number }> = new Map();
  private cacheTimeout = 60 * 1000; // 1 minute

  async getTranslations(locale: 'az' | 'ru', namespace?: string): Promise<Record<string, string>> {
    const cacheKey = `${locale}-${namespace || 'all'}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.translations;
    }

    try {
      const queries: string[] = [];
      if (namespace) {
        queries.push(Query.equal('namespace', namespace));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TRANSLATIONS,
        queries
      );

      const translations: Record<string, string> = {};
      (response.documents || []).forEach((item: any) => {
        translations[item.key] = locale === 'az' ? item.value_az : item.value_ru;
      });

      this.cache.set(cacheKey, { translations, timestamp: Date.now() });
      return translations;
    } catch (error) {
      console.error('Error loading translations:', error);
      return {};
    }
  }

  async getAllTranslations(): Promise<Translation[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TRANSLATIONS,
        [
          Query.orderAsc('namespace'),
          Query.orderAsc('key')
        ]
      );

      return (response.documents || []).map((doc: any) => ({
        id: doc.$id,
        key: doc.key,
        namespace: doc.namespace,
        value_az: doc.value_az,
        value_ru: doc.value_ru,
        description: doc.description,
      }));
    } catch (error) {
      console.error('Error loading all translations:', error);
      return [];
    }
  }

  async updateTranslation(id: string, value_az: string, value_ru: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSLATIONS,
        id,
        { value_az, value_ru }
      );
      
      // Clear cache
      this.cache.clear();
    } catch (error) {
      console.error('Error updating translation:', error);
      throw error;
    }
  }

  async createTranslation(
    key: string,
    namespace: string,
    value_az: string,
    value_ru: string,
    description?: string
  ): Promise<Translation> {
    try {
      const created = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSLATIONS,
        ID.unique(),
        {
          key,
          namespace,
          value_az,
          value_ru,
          description,
        }
      );

      // Clear cache
      this.cache.clear();

      return {
        id: created.$id,
        key: created.key,
        namespace: created.namespace,
        value_az: created.value_az,
        value_ru: created.value_ru,
        description: created.description,
      };
    } catch (error) {
      console.error('Error creating translation:', error);
      throw error;
    }
  }

  async deleteTranslation(id: string): Promise<void> {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TRANSLATIONS, id);
      this.cache.clear();
    } catch (error) {
      console.error('Error deleting translation:', error);
      throw error;
    }
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSetting[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SITE_SETTINGS,
        [Query.orderAsc('key')]
      );

      return (response.documents || []).map((doc: any) => ({
        id: doc.$id,
        key: doc.key,
        value_az: doc.value_az,
        value_ru: doc.value_ru,
        value_json: doc.value_json,
        setting_type: doc.setting_type,
      }));
    } catch (error) {
      console.error('Error loading site settings:', error);
      return [];
    }
  }

  async getSiteSetting(key: string): Promise<SiteSetting | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SITE_SETTINGS,
        [Query.equal('key', key), Query.limit(1)]
      );

      if (response.documents.length === 0) return null;

      const doc = response.documents[0];
      return {
        id: doc.$id,
        key: doc.key,
        value_az: doc.value_az,
        value_ru: doc.value_ru,
        value_json: doc.value_json,
        setting_type: doc.setting_type,
      };
    } catch (error) {
      console.error('Error loading site setting:', error);
      return null;
    }
  }

  async updateSiteSetting(
    id: string,
    updates: { value_az?: string; value_ru?: string; value_json?: any }
  ): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.SITE_SETTINGS,
        id,
        updates
      );
    } catch (error) {
      console.error('Error updating site setting:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const translationService = new TranslationService();
