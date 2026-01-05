// Cache utility functions for browser refresh handling
import { cache } from '../services/cache';
import { translationService } from '../services/translations';

// Clear all caches on page load (handles browser refresh)
export const clearCachesOnLoad = () => {
  // Check if this is a fresh page load (not navigation)
  const isPageRefresh = performance.navigation.type === performance.navigation.TYPE_RELOAD;
  
  if (isPageRefresh) {
    cache.clear();
    translationService.clearCache();
  }
};

// Call on app initialization
if (typeof window !== 'undefined') {
  // Clear caches on page refresh
  window.addEventListener('beforeunload', () => {
    // Optional: could save state here if needed
  });
  
  // Clear caches on page load if it's a refresh
  if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    cache.clear();
    translationService.clearCache();
  }
}

