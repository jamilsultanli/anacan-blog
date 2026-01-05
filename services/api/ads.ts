import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../appwrite';
import { AdSpace, Ad } from '../../types';

class AdsService {
  async getAdSpaces(): Promise<{ data: AdSpace[]; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.AD_SPACES,
        [Query.orderDesc('$createdAt')]
      );

      const adSpaces: AdSpace[] = (response.documents || []).map((doc: any) => ({
        id: doc.$id,
        name: doc.name,
        slug: doc.slug,
        description: doc.description,
        position: doc.position,
        width: doc.width,
        height: doc.height,
        isActive: doc.is_active,
        createdAt: doc.$createdAt ? new Date(doc.$createdAt).toISOString() : undefined,
        updatedAt: doc.$updatedAt ? new Date(doc.$updatedAt).toISOString() : undefined,
      }));

      return { data: adSpaces, error: null };
    } catch (error: any) {
      console.error('Error getting ad spaces:', error);
      return { data: [], error: new Error(error.message || 'Failed to get ad spaces') };
    }
  }

  async createAdSpace(adSpace: Omit<AdSpace, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: AdSpace | null; error: Error | null }> {
    try {
      const created = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.AD_SPACES,
        ID.unique(),
        {
          name: adSpace.name,
          slug: adSpace.slug,
          description: adSpace.description,
          position: adSpace.position,
          width: adSpace.width,
          height: adSpace.height,
          is_active: adSpace.isActive,
        }
      );

      const newAdSpace: AdSpace = {
        id: created.$id,
        name: created.name,
        slug: created.slug,
        description: created.description,
        position: created.position,
        width: created.width,
        height: created.height,
        isActive: created.is_active,
        createdAt: created.$createdAt ? new Date(created.$createdAt).toISOString() : undefined,
        updatedAt: created.$updatedAt ? new Date(created.$updatedAt).toISOString() : undefined,
      };

      return { data: newAdSpace, error: null };
    } catch (error: any) {
      console.error('Error creating ad space:', error);
      return { data: null, error: new Error(error.message || 'Failed to create ad space') };
    }
  }

  async updateAdSpace(id: string, updates: Partial<AdSpace>): Promise<{ data: AdSpace | null; error: Error | null }> {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.slug !== undefined) updateData.slug = updates.slug;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.position !== undefined) updateData.position = updates.position;
      if (updates.width !== undefined) updateData.width = updates.width;
      if (updates.height !== undefined) updateData.height = updates.height;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const updated = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.AD_SPACES,
        id,
        updateData
      );

      const adSpace: AdSpace = {
        id: updated.$id,
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        position: updated.position,
        width: updated.width,
        height: updated.height,
        isActive: updated.is_active,
        createdAt: updated.$createdAt ? new Date(updated.$createdAt).toISOString() : undefined,
        updatedAt: updated.$updatedAt ? new Date(updated.$updatedAt).toISOString() : undefined,
      };

      return { data: adSpace, error: null };
    } catch (error: any) {
      console.error('Error updating ad space:', error);
      return { data: null, error: new Error(error.message || 'Failed to update ad space') };
    }
  }

  async deleteAdSpace(id: string): Promise<{ error: Error | null }> {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.AD_SPACES, id);
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting ad space:', error);
      return { error: new Error(error.message || 'Failed to delete ad space') };
    }
  }

  async getAds(): Promise<{ data: Ad[]; error: Error | null }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ADS,
        [Query.orderDesc('$createdAt')]
      );

      const ads: Ad[] = (response.documents || []).map((doc: any) => ({
        id: doc.$id,
        adSpaceId: doc.ad_space_id,
        title: doc.title,
        type: doc.type,
        content: doc.content,
        imageUrl: doc.image_url,
        videoUrl: doc.video_url,
        linkUrl: doc.link_url,
        startDate: doc.start_date,
        endDate: doc.end_date,
        isActive: doc.is_active,
        clickCount: doc.click_count || 0,
        impressionCount: doc.impression_count || 0,
        createdAt: doc.$createdAt ? new Date(doc.$createdAt).toISOString() : undefined,
        updatedAt: doc.$updatedAt ? new Date(doc.$updatedAt).toISOString() : undefined,
      }));

      return { data: ads, error: null };
    } catch (error: any) {
      console.error('Error getting ads:', error);
      return { data: [], error: new Error(error.message || 'Failed to get ads') };
    }
  }

  async getAdsBySlug(slug: string): Promise<{ data: Ad | null; error: Error | null }> {
    try {
      // First get ad space by slug
      const spacesResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.AD_SPACES,
        [
          Query.equal('slug', slug),
          Query.equal('is_active', true)
        ]
      );

      if (spacesResponse.documents.length === 0) {
        return { data: null, error: null };
      }

      const spaceId = spacesResponse.documents[0].$id;
      
      // Get active ads for this space
      const now = new Date().toISOString();
      const adsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ADS,
        [
          Query.equal('is_active', true),
          Query.equal('ad_space_id', spaceId)
        ]
      );

      // Filter by date range and get first active ad
      const activeAd = (adsResponse.documents || [])
        .filter((doc: any) => {
          // Check if ad is within date range
          if (doc.start_date && new Date(doc.start_date) > new Date(now)) return false;
          if (doc.end_date && new Date(doc.end_date) < new Date(now)) return false;
          return true;
        })
        .map((doc: any) => ({
          id: doc.$id,
          adSpaceId: doc.ad_space_id,
          title: doc.title,
          type: doc.type,
          content: doc.content,
          imageUrl: doc.image_url,
          videoUrl: doc.video_url,
          linkUrl: doc.link_url,
          startDate: doc.start_date,
          endDate: doc.end_date,
          isActive: doc.is_active,
          clickCount: doc.click_count || 0,
          impressionCount: doc.impression_count || 0,
          createdAt: doc.$createdAt ? new Date(doc.$createdAt).toISOString() : undefined,
          updatedAt: doc.$updatedAt ? new Date(doc.$updatedAt).toISOString() : undefined,
        }))[0]; // Get first active ad

      return { data: activeAd || null, error: null };
    } catch (error: any) {
      console.error('Error getting ad by slug:', error);
      return { data: null, error: new Error(error.message || 'Failed to get ad by slug') };
    }
  }

  async getAdsByPosition(position: string): Promise<{ data: Ad[]; error: Error | null }> {
    try {
      // First get ad spaces with this position
      const spacesResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.AD_SPACES,
        [
          Query.equal('position', position),
          Query.equal('is_active', true)
        ]
      );

      if (spacesResponse.documents.length === 0) {
        return { data: [], error: null };
      }

      const spaceIds = spacesResponse.documents.map((doc: any) => doc.$id);
      
      // Get all active ads and filter by space IDs client-side
      const now = new Date().toISOString();
      const adsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ADS,
        [Query.equal('is_active', true)]
      );

      // Filter by space IDs and date range, then map to Ad type
      const ads: Ad[] = (adsResponse.documents || [])
        .filter((doc: any) => {
          // Check if ad belongs to one of the spaces
          if (!spaceIds.includes(doc.ad_space_id)) return false;
          // Check if ad is within date range
          if (doc.start_date && new Date(doc.start_date) > new Date(now)) return false;
          if (doc.end_date && new Date(doc.end_date) < new Date(now)) return false;
          return true;
        })
        .map((doc: any) => ({
          id: doc.$id,
          adSpaceId: doc.ad_space_id,
          title: doc.title,
          type: doc.type,
          content: doc.content,
          imageUrl: doc.image_url,
          videoUrl: doc.video_url,
          linkUrl: doc.link_url,
          startDate: doc.start_date,
          endDate: doc.end_date,
          isActive: doc.is_active,
          clickCount: doc.click_count || 0,
          impressionCount: doc.impression_count || 0,
          createdAt: doc.$createdAt ? new Date(doc.$createdAt).toISOString() : undefined,
          updatedAt: doc.$updatedAt ? new Date(doc.$updatedAt).toISOString() : undefined,
        }));

      return { data: ads, error: null };
    } catch (error: any) {
      console.error('Error getting ads by position:', error);
      return { data: [], error: new Error(error.message || 'Failed to get ads by position') };
    }
  }

  async createAd(ad: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Ad | null; error: Error | null }> {
    try {
      const created = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ADS,
        ID.unique(),
        {
          ad_space_id: ad.adSpaceId,
          title: ad.title,
          type: ad.type,
          content: ad.content,
          image_url: ad.imageUrl,
          video_url: ad.videoUrl,
          link_url: ad.linkUrl,
          start_date: ad.startDate,
          end_date: ad.endDate,
          is_active: ad.isActive,
          click_count: 0,
          impression_count: 0,
        }
      );

      const newAd: Ad = {
        id: created.$id,
        adSpaceId: created.ad_space_id,
        title: created.title,
        type: created.type,
        content: created.content,
        imageUrl: created.image_url,
        videoUrl: created.video_url,
        linkUrl: created.link_url,
        startDate: created.start_date,
        endDate: created.end_date,
        isActive: created.is_active,
        clickCount: 0,
        impressionCount: 0,
        createdAt: created.$createdAt ? new Date(created.$createdAt).toISOString() : undefined,
        updatedAt: created.$updatedAt ? new Date(created.$updatedAt).toISOString() : undefined,
      };

      return { data: newAd, error: null };
    } catch (error: any) {
      console.error('Error creating ad:', error);
      return { data: null, error: new Error(error.message || 'Failed to create ad') };
    }
  }

  async updateAd(id: string, updates: Partial<Ad>): Promise<{ data: Ad | null; error: Error | null }> {
    try {
      const updateData: any = {};
      if (updates.adSpaceId !== undefined) updateData.ad_space_id = updates.adSpaceId;
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
      if (updates.videoUrl !== undefined) updateData.video_url = updates.videoUrl;
      if (updates.linkUrl !== undefined) updateData.link_url = updates.linkUrl;
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const updated = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ADS,
        id,
        updateData
      );

      const ad: Ad = {
        id: updated.$id,
        adSpaceId: updated.ad_space_id,
        title: updated.title,
        type: updated.type,
        content: updated.content,
        imageUrl: updated.image_url,
        videoUrl: updated.video_url,
        linkUrl: updated.link_url,
        startDate: updated.start_date,
        endDate: updated.end_date,
        isActive: updated.is_active,
        clickCount: updated.click_count || 0,
        impressionCount: updated.impression_count || 0,
        createdAt: updated.$createdAt ? new Date(updated.$createdAt).toISOString() : undefined,
        updatedAt: updated.$updatedAt ? new Date(updated.$updatedAt).toISOString() : undefined,
      };

      return { data: ad, error: null };
    } catch (error: any) {
      console.error('Error updating ad:', error);
      return { data: null, error: new Error(error.message || 'Failed to update ad') };
    }
  }

  async deleteAd(id: string): Promise<{ error: Error | null }> {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.ADS, id);
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting ad:', error);
      return { error: new Error(error.message || 'Failed to delete ad') };
    }
  }

  async trackImpression(adId: string): Promise<{ error: Error | null }> {
    try {
      // Get current ad to increment impression count
      const ad = await databases.getDocument(DATABASE_ID, COLLECTIONS.ADS, adId);
      const currentImpressions = ad.impression_count || 0;
      
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ADS,
        adId,
        {
          impression_count: currentImpressions + 1
        }
      );
      
      return { error: null };
    } catch (error: any) {
      console.error('Error tracking impression:', error);
      return { error: new Error(error.message || 'Failed to track impression') };
    }
  }

  async trackClick(adId: string): Promise<{ error: Error | null }> {
    try {
      // Get current ad to increment click count
      const ad = await databases.getDocument(DATABASE_ID, COLLECTIONS.ADS, adId);
      const currentClicks = ad.click_count || 0;
      
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ADS,
        adId,
        {
          click_count: currentClicks + 1
        }
      );
      
      return { error: null };
    } catch (error: any) {
      console.error('Error tracking click:', error);
      return { error: new Error(error.message || 'Failed to track click') };
    }
  }
}

export const adsService = new AdsService();

