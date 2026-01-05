import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../appwrite';
import { NewsletterSubscription } from '../../types';

class NewsletterService {
  async getSubscriptions(): Promise<{ data: NewsletterSubscription[]; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NEWSLETTER_SUBSCRIPTIONS,
        [Query.orderDesc('subscribed_at')]
      );

      const subscriptions: NewsletterSubscription[] = (response.documents || []).map((doc: any) => ({
        id: doc.$id,
        email: doc.email,
        name: doc.name || '',
        surname: doc.surname || '',
        isActive: doc.is_active !== false, // Default to true if not set
        subscribedAt: doc.subscribed_at || doc.$createdAt,
        unsubscribedAt: doc.unsubscribed_at || undefined,
      }));

      return { data: subscriptions, error: null };
    } catch (error: any) {
      console.error('Error getting newsletter subscriptions:', error);
      return { data: [], error: new Error(error.message || 'Failed to get subscriptions') };
    }
  }

  async getSubscriptionById(id: string): Promise<{ data: NewsletterSubscription | null; error: Error | null }> {
    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.NEWSLETTER_SUBSCRIPTIONS,
        id
      );

      const subscription: NewsletterSubscription = {
        id: doc.$id,
        email: doc.email,
        name: doc.name || '',
        surname: doc.surname || '',
        isActive: doc.is_active !== false,
        subscribedAt: doc.subscribed_at || doc.$createdAt,
        unsubscribedAt: doc.unsubscribed_at || undefined,
      };

      return { data: subscription, error: null };
    } catch (error: any) {
      console.error('Error getting subscription:', error);
      return { data: null, error: new Error(error.message || 'Failed to get subscription') };
    }
  }

  async deleteSubscription(id: string): Promise<{ error: Error | null }> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.NEWSLETTER_SUBSCRIPTIONS,
        id
      );
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting subscription:', error);
      return { error: new Error(error.message || 'Failed to delete subscription') };
    }
  }

  async updateSubscription(
    id: string,
    updates: { isActive?: boolean }
  ): Promise<{ data: NewsletterSubscription | null; error: Error | null }> {
    try {
      const updateData: any = {};
      
      if (updates.isActive !== undefined) {
        updateData.is_active = updates.isActive;
        if (!updates.isActive) {
          updateData.unsubscribed_at = new Date().toISOString();
        } else {
          updateData.unsubscribed_at = null;
        }
      }

      const doc = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.NEWSLETTER_SUBSCRIPTIONS,
        id,
        updateData
      );

      const subscription: NewsletterSubscription = {
        id: doc.$id,
        email: doc.email,
        name: doc.name || '',
        surname: doc.surname || '',
        isActive: doc.is_active !== false,
        subscribedAt: doc.subscribed_at || doc.$createdAt,
        unsubscribedAt: doc.unsubscribed_at || undefined,
      };

      return { data: subscription, error: null };
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      return { data: null, error: new Error(error.message || 'Failed to update subscription') };
    }
  }

  async exportSubscriptions(): Promise<{ data: string; error: Error | null }> {
    try {
      const { data, error } = await this.getSubscriptions();
      if (error) throw error;

      // Create CSV content
      const headers = ['Email', 'Ad', 'Soyad', 'Abunə Tarixi', 'Status'];
      const rows = data.map(sub => [
        sub.email,
        sub.name || '',
        sub.surname || '',
        new Date(sub.subscribedAt).toLocaleDateString('az-AZ'),
        sub.isActive ? 'Aktiv' : 'Deaktiv'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return { data: csvContent, error: null };
    } catch (error: any) {
      console.error('Error exporting subscriptions:', error);
      return { data: '', error: new Error(error.message || 'Failed to export subscriptions') };
    }
  }
}

export const newsletterService = new NewsletterService();

