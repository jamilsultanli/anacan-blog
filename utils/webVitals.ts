export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (!onPerfEntry || typeof window === 'undefined') return;

  // Dynamic import for web-vitals
  // Silently fail if not available (expected in some environments)
  import('web-vitals')
    .then((vitals) => {
      const { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } = vitals;
      
      onCLS(onPerfEntry);
      onFID(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
      if (onINP) {
        onINP(onPerfEntry);
      }
    })
    .catch(() => {
      // Silently fail - web-vitals is optional
    });
};
