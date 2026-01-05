import React, { useEffect, useState } from 'react';
import { adsService } from '../services/api/ads';
import { Ad } from '../types';
import LazyImage from './LazyImage';

interface AdBannerProps {
  position?: string;
  slug?: string;
  className?: string;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
  native?: boolean;
}

const AdContent: React.FC<{ ad: Ad; className?: string; native?: boolean; onClick?: () => void }> = ({ 
  ad, 
  className = '', 
  native = false,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    if (ad.linkUrl) {
      window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (native) {
    // Native ad format - looks like content
    return (
      <div className={`w-full ${className}`}>
        {ad.type === 'banner' && ad.imageUrl ? (
          <div className="relative w-full rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white border border-gray-200">
            {ad.linkUrl ? (
              <button
                onClick={handleClick}
                className="block w-full cursor-pointer"
                aria-label={ad.title}
              >
                <LazyImage
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-auto object-cover"
                />
                {ad.title && (
                  <div className="p-3 bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">{ad.title}</p>
                    {ad.content && (
                      <p className="text-xs text-gray-600 mt-1">{ad.content}</p>
                    )}
                  </div>
                )}
              </button>
            ) : (
              <>
                <LazyImage
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-auto object-cover"
                />
                {ad.title && (
                  <div className="p-3 bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">{ad.title}</p>
                    {ad.content && (
                      <p className="text-xs text-gray-600 mt-1">{ad.content}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ) : ad.content ? (
          <div
            className="w-full rounded-lg p-4 bg-white border border-gray-200"
            dangerouslySetInnerHTML={{ __html: ad.content }}
          />
        ) : null}
      </div>
    );
  }

  // Regular banner format
  return (
    <div className={`w-full h-full flex items-center justify-center relative z-20 ${className}`}>
      {ad.type === 'banner' && ad.imageUrl ? (
        <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          {ad.linkUrl ? (
            <button
              onClick={handleClick}
              className="block w-full h-full cursor-pointer"
              aria-label={ad.title}
            >
              <LazyImage
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </button>
          ) : (
            <LazyImage
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full h-full object-cover rounded-lg"
            />
          )}
        </div>
      ) : ad.content ? (
        <div
          className="w-full h-full rounded-lg p-4 md:p-6 bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: ad.content }}
        />
      ) : null}
    </div>
  );
};

const AdBanner: React.FC<AdBannerProps> = ({ position, slug, className = '', mobileOnly = false, desktopOnly = false, native = false }) => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAd = async () => {
      setLoading(true);
      try {
        let adData: Ad | null = null;
        
        if (slug) {
          // Use slug if provided (preferred method)
          const { data } = await adsService.getAdsBySlug(slug);
          adData = data;
        } else if (position) {
          // Fallback to position
          const { data } = await adsService.getAdsByPosition(position);
          if (data && data.length > 0) {
            adData = data[0];
          }
        }
        
        if (adData) {
          setAd(adData);
          // Track impression
          try {
            await adsService.trackImpression(adData.id);
          } catch (error) {
            console.error('Error tracking impression:', error);
          }
        }
      } catch (error) {
        console.error('Error loading ad:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAd();
  }, [position, slug]);

  if (loading) {
    if (mobileOnly || desktopOnly) {
      return (
        <div className={`w-full ${className}`}>
          <div className="w-full h-20 bg-gray-100/50 rounded-lg animate-pulse"></div>
        </div>
      );
    }
    if (className.includes('w-full h-full')) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full h-full bg-gray-100/50 rounded-lg animate-pulse"></div>
        </div>
      );
    }
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="w-full max-w-4xl h-48 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (!ad) {
    return null;
  }

  // Handle responsive visibility
  const handleClick = async () => {
    if (ad) {
      try {
        await adsService.trackClick(ad.id);
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    }
  };

  if (mobileOnly) {
    return (
      <div className={`lg:hidden ${className}`}>
        <AdContent ad={ad} native={native} onClick={handleClick} />
      </div>
    );
  }

  if (desktopOnly) {
    return (
      <div className={`hidden lg:block ${className}`}>
        <AdContent ad={ad} native={native} onClick={handleClick} />
      </div>
    );
  }

  // If className includes specific positioning, use it directly
  if (className.includes('w-full h-full')) {
    return <AdContent ad={ad} className={className} native={native} onClick={handleClick} />;
  }

  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <AdContent ad={ad} native={native} onClick={handleClick} />
    </div>
  );
};

export default AdBanner;
