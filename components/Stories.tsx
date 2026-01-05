import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { storiesService } from '../services/api/stories';
import { Story } from '../types';
import LazyImage from './LazyImage';

interface StoriesProps {
  limit?: number;
}

const Stories: React.FC<StoriesProps> = ({ limit }) => {
  const { locale } = useLanguage();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    const loadStories = async () => {
      setLoading(true);
      try {
        const { data } = await storiesService.getStories(true);
        let processedStories = data;
        
        // If limit is set and we have fewer stories than the limit, repeat from the beginning
        if (limit && data.length > 0 && data.length < limit) {
          const repeatedStories: Story[] = [];
          while (repeatedStories.length < limit) {
            repeatedStories.push(...data);
          }
          processedStories = repeatedStories.slice(0, limit);
        } else if (limit) {
          processedStories = data.slice(0, limit);
        }
        
        setStories(processedStories);
      } catch (error) {
        console.error('Error loading stories:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStories();
  }, [limit]);

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    setSelectedStory(null);
  };

  if (loading) {
    const loadingCount = limit || 8;
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {Array.from({ length: loadingCount }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-20 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {stories.map((story, index) => (
          <button
            key={`${story.id}-${index}`}
            onClick={() => handleStoryClick(story)}
            className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-pink-500 ring-offset-2 ring-offset-white group-hover:ring-pink-600 transition-all shadow-md">
              <LazyImage
                src={story.imageUrl}
                alt={story.title?.[locale] || 'Story'}
                className="w-full h-full object-cover"
              />
            </div>
            {story.title?.[locale] && (
              <span className="text-xs text-gray-700 text-center max-w-[80px] truncate group-hover:text-pink-600 transition-colors font-medium">
                {story.title[locale]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {isViewerOpen && selectedStory && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeViewer}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
            style={{ aspectRatio: '9/16', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeViewer}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Story Image - 1080x1920 aspect ratio */}
            <div className="relative w-full h-full" style={{ aspectRatio: '9/16' }}>
              <LazyImage
                src={selectedStory.imageUrl}
                alt={selectedStory.title?.[locale] || 'Story'}
                className="w-full h-full object-cover"
              />
              
              {/* Story Content Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end">
                {selectedStory.title?.[locale] && (
                  <div className="px-4 pb-4">
                    <h3 className="text-white text-xl font-semibold mb-4 drop-shadow-lg">
                      {selectedStory.title[locale]}
                    </h3>
                  </div>
                )}
                
                {selectedStory.linkUrl && (
                  <div className="px-4 pb-6">
                    <Link
                      to={selectedStory.linkUrl}
                      onClick={closeViewer}
                      className="block w-full bg-white text-gray-900 px-6 py-3 rounded-full text-center font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      {selectedStory.linkText?.[locale] || (locale === 'az' ? 'Daha çox' : 'Подробнее')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default Stories;

