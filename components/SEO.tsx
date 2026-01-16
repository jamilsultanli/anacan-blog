import React, { useEffect } from 'react';
import { BlogPost, Category } from '../types';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  post?: BlogPost;
  category?: Category;
  locale?: 'az' | 'ru';
  keywords?: string[];
}

const SEO: React.FC<SEOProps> = ({
  title = 'Anacan.az - Müasir Ana Platforması',
  description = 'Azərbaycanın ən müasir ana platforması. Hamiləlikdən uşaq tərbiyəsinə qədər hər şey burada.',
  image = 'https://anacan.az/og-image.jpg',
  url = typeof window !== 'undefined' ? window.location.href : 'https://anacan.az',
  type = 'website',
  post,
  category,
  locale = 'az',
  keywords = [],
}) => {
  const finalTitle = post 
    ? `${post.title[locale]} | Anacan.az` 
    : title;
  const finalDescription = post 
    ? (post.excerpt[locale] || description.substring(0, 160))
    : description;
  const finalImage = post 
    ? (post.imageUrl || image)
    : image;
  const finalUrl = post 
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://anacan.az'}/blog/${post.slug}` 
    : url;
  
  const finalKeywords = post && post.tags
    ? [...keywords, ...post.tags.map(t => t.name[locale])].join(', ')
    : keywords.length > 0
    ? keywords.join(', ')
    : 'ana platforması, hamiləlik, uşaq tərbiyəsi, Azərbaycan';

  // Enhanced Structured Data
  const getStructuredData = () => {
    if (post) {
      const articleData: any = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `${finalUrl}#article`,
        headline: post.title[locale],
        description: finalDescription,
        image: {
          '@type': 'ImageObject',
          url: finalImage,
          width: 1200,
          height: 630,
        },
        datePublished: post.published_at,
        dateModified: post.updatedAt || post.published_at,
        author: {
          '@type': 'Person',
          name: post.author || 'Anacan.az',
          url: 'https://anacan.az',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Anacan.az',
          logo: {
            '@type': 'ImageObject',
            url: 'https://anacan.az/logo.png',
            width: 200,
            height: 200,
          },
          sameAs: [
            'https://www.facebook.com/anacan.az',
            'https://www.instagram.com/anacan.az',
          ],
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': finalUrl,
        },
        inLanguage: locale === 'az' ? 'az-AZ' : 'ru-RU',
        wordCount: post.content[locale]?.replace(/\s+/g, ' ').trim().split(' ').length || 0,
        articleSection: category?.name[locale] || '',
        keywords: finalKeywords,
        timeRequired: `PT${post.readTime || 5}M`,
      };

      // Breadcrumb structure
      const breadcrumbData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: locale === 'az' ? 'Ana Səhifə' : 'Главная',
            item: 'https://anacan.az',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: locale === 'az' ? 'Blog' : 'Блог',
            item: 'https://anacan.az/blog',
          },
          ...(category ? [{
            '@type': 'ListItem',
            position: 3,
            name: category.name[locale],
            item: `https://anacan.az/category/${category.slug}`,
          }] : []),
          {
            '@type': 'ListItem',
            position: category ? 4 : 3,
            name: post.title[locale],
            item: finalUrl,
          },
        ],
      };

      return [articleData, breadcrumbData];
    } else {
      // Organization schema
      const organizationData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Anacan.az',
        url: 'https://anacan.az',
        logo: {
          '@type': 'ImageObject',
          url: 'https://anacan.az/logo.png',
          width: 200,
          height: 200,
        },
        description: 'Azərbaycanın ən müasir ana platforması',
        sameAs: [
          'https://www.facebook.com/anacan.az',
          'https://www.instagram.com/anacan.az',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          availableLanguage: ['az-AZ', 'ru-RU'],
        },
      };

      // WebSite schema with SearchAction
      const websiteData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Anacan.az',
        url: 'https://anacan.az',
        description: description,
        inLanguage: ['az-AZ', 'ru-RU'],
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://anacan.az/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      };

      return [organizationData, websiteData];
    }
  };

  useEffect(() => {
    // Update title
    document.title = finalTitle;

    // Helper function
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      if (!content) return;
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic SEO
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);
    updateMetaTag('author', post?.author || 'Anacan.az');
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('googlebot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    
    // Open Graph
    updateMetaTag('og:type', post ? 'article' : 'website', true);
    updateMetaTag('og:title', finalTitle, true);
    updateMetaTag('og:description', finalDescription, true);
    updateMetaTag('og:image', finalImage, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:alt', finalTitle, true);
    updateMetaTag('og:image:type', 'image/jpeg', true);
    updateMetaTag('og:url', finalUrl, true);
    updateMetaTag('og:site_name', 'Anacan.az', true);
    updateMetaTag('og:locale', locale === 'az' ? 'az_AZ' : 'ru_RU', true);
    updateMetaTag('og:locale:alternate', locale === 'az' ? 'ru_RU' : 'az_AZ', true);

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@anacanaz');
    updateMetaTag('twitter:creator', '@anacanaz');
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    updateMetaTag('twitter:image', finalImage);
    updateMetaTag('twitter:image:alt', finalTitle);

    // Article specific
    if (post) {
      updateMetaTag('article:published_time', post.published_at || '', true);
      updateMetaTag('article:modified_time', post.updatedAt || post.published_at || '', true);
      updateMetaTag('article:author', post.author || 'Anacan.az', true);
      if (category) {
        updateMetaTag('article:section', category.name[locale], true);
      }
      if (post.tags && post.tags.length > 0) {
        post.tags.forEach((tag) => {
          updateMetaTag('article:tag', tag.name[locale], true);
        });
      }
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', finalUrl);

    // Hreflang tags
    const updateHreflang = (lang: string, href: string) => {
      let link = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', lang);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    if (post) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://anacan.az';
      updateHreflang('az', `${baseUrl}/blog/${post.slug}?lang=az`);
      updateHreflang('ru', `${baseUrl}/blog/${post.slug}?lang=ru`);
      updateHreflang('x-default', `${baseUrl}/blog/${post.slug}`);
    }

    // Structured data
    const structuredDataArray = getStructuredData();
    structuredDataArray.forEach((data, index) => {
      let script = document.querySelector(`script[type="application/ld+json"][data-seo-index="${index}"]`);
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-seo-index', index.toString());
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(data);
    });

  }, [finalTitle, finalDescription, finalImage, finalUrl, type, locale, post, category, finalKeywords]);

  return null;
};

export default SEO;