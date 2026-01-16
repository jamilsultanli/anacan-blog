export const initGA = (measurementId: string) => {
  if (typeof window === 'undefined' || (window as any).gtag) return;
  
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);
  
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      page_path: window.location.pathname,
      send_page_view: true
    });
  `;
  document.head.appendChild(script2);
};

export const trackPageView = (path: string, title?: string) => {
  if (typeof window === 'undefined' || !(window as any).gtag) return;
  
  (window as any).gtag('config', process.env.VITE_GA_MEASUREMENT_ID || '', {
    page_path: path,
    page_title: title || document.title,
  });
};

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window === 'undefined' || !(window as any).gtag) return;
  
  (window as any).gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

