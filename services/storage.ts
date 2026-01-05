import { storage, ID } from './appwrite';

export interface UploadOptions {
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

class StorageService {
  private readonly BUCKET_ID = 'anacan-uploads'; // Appwrite bucket ID
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB default
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  async uploadImage(
    file: File,
    options: UploadOptions = {}
  ): Promise<{ url: string | null; error: Error | null }> {
    try {
      // Validate file
      const validationError = this.validateImage(file, options);
      if (validationError) {
        return { url: null, error: validationError };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${options.folder || 'images'}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Appwrite Storage
      const fileResult = await storage.createFile(
        this.BUCKET_ID,
        ID.unique(),
        file
      );

      // Get public URL
      const url = storage.getFileView(this.BUCKET_ID, fileResult.$id);

      return { url, error: null };
    } catch (error: any) {
      console.error('Error uploading image:', error);
      return { url: null, error: new Error(error.message || 'Failed to upload image') };
    }
  }

  async uploadMultipleImages(
    files: File[],
    options: UploadOptions = {}
  ): Promise<{ urls: string[]; errors: Error[] }> {
    const urls: string[] = [];
    const errors: Error[] = [];

    for (const file of files) {
      const result = await this.uploadImage(file, options);
      if (result.url) {
        urls.push(result.url);
      } else if (result.error) {
        errors.push(result.error);
      }
    }

    return { urls, errors };
  }

  async deleteImage(fileId: string): Promise<{ error: Error | null }> {
    try {
      // Extract file ID from URL if needed
      // Appwrite file URLs contain the file ID, extract it
      const fileIdFromUrl = fileId.includes('/storage/buckets/') 
        ? fileId.split('/files/')[1]?.split('/')[0]
        : fileId;

      await storage.deleteFile(this.BUCKET_ID, fileIdFromUrl);
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting image:', error);
      return { error: new Error(error.message || 'Failed to delete image') };
    }
  }

  private validateImage(file: File, options: UploadOptions): Error | null {
    const maxSize = (options.maxSizeMB || 5) * 1024 * 1024;
    const allowedTypes = options.allowedTypes || this.ALLOWED_IMAGE_TYPES;

    if (file.size > maxSize) {
      return new Error(`File size exceeds ${options.maxSizeMB || 5}MB limit`);
    }

    if (!allowedTypes.includes(file.type)) {
      return new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return null;
  }

  // Get image URL from file ID
  getImageUrl(fileId: string): string {
    return storage.getFileView(this.BUCKET_ID, fileId);
  }
}

export const storageService = new StorageService();
