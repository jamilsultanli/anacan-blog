import React, { useState, useRef } from 'react';
import { storageService } from '../services/storage';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  folder?: string;
  maxSizeMB?: number;
  locale?: 'az' | 'ru';
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  currentImageUrl,
  folder = 'images',
  maxSizeMB = 5,
  locale = 'az',
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    const { url, error: uploadError } = await storageService.uploadImage(file, {
      folder,
      maxSizeMB,
    });

    if (uploadError || !url) {
      setError(uploadError?.message || (locale === 'az' ? 'Yükləmə zamanı xəta baş verdi' : 'Ошибка при загрузке'));
      setPreview(null);
    } else {
      onUploadComplete(url);
    }

    setUploading(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border border-gray-300"
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              type="button"
              onClick={handleClick}
              disabled={uploading}
              className="px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
            >
              {locale === 'az' ? 'Dəyiş' : 'Изменить'}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 disabled:opacity-50 text-sm font-medium"
            >
              {locale === 'az' ? 'Sil' : 'Удалить'}
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={dropZoneRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleClick}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            uploading
              ? 'border-pink-400 bg-pink-50'
              : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
          }`}
        >
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
              <p className="text-sm text-gray-600">
                {locale === 'az' ? 'Yüklənir...' : 'Загрузка...'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm text-gray-600">
                {locale === 'az' 
                  ? 'Şəkli buraya sürükləyin və ya klikləyin' 
                  : 'Перетащите изображение сюда или нажмите'}
              </p>
              <p className="text-xs text-gray-500">
                {locale === 'az' 
                  ? `JPG, PNG, GIF (maks. ${maxSizeMB}MB)` 
                  : `JPG, PNG, GIF (макс. ${maxSizeMB}MB)`}
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

