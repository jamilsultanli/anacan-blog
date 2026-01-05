import React, { useEffect } from 'react';
import { BlogPost } from '../types';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  post?: BlogPost;
  locale?: 'az' | 'ru';
}

const SEO: React.FC<SEOProps> = ({
  title = 'Anacan.az - Müasir Ana Platforması',
  description = 'Azərbaycanın ən müasir ana platforması. Hamiləlikdən uşaq tərbiyəsinə qədər hər şey burada.',
  image = 'https://anacan.az/og-image.jpg',
  url = typeof window !== 'undefined' ? window.location.href : 'https://anacan.az',
  type = 'website',
  post,
  locale = 'az',
}) => {
  const finalTitle = post ? `${post.title[locale]} | Anacan.az` : title;
  const finalDescription = post ? post.excerpt[locale] : description;
  const finalImage = post ? post.imageUrl : image;
  const finalUrl = post ? `${typeof window !== 'undefined' ? window.location.origin : 'https://anacan.az'}/blog/${post.slug}` : url;

  const structuredData = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title[locale],
        description: post.excerpt[locale],
        image: post.imageUrl,
        datePublished: post.published_at,
        dateModified: post.updatedAt || post.published_at,
        author: {
          '@type': 'Person',
          name: post.author,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Anacan.az',
          logo: {
            '@type': 'ImageObject',
            url: 'https://anacan.az/logo.png',
          },
        },
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Anacan.az',
        description: 'Azərbaycanın ən müasir ana platforması',
        url: 'https://anacan.az',
      };

  useEffect(() => {
    // Update title
    document.title = finalTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMetaTag('description', finalDescription);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:title', finalTitle, true);
    updateMetaTag('og:description', finalDescription, true);
    updateMetaTag('og:image', finalImage, true);
    updateMetaTag('og:url', finalUrl, true);
    updateMetaTag('og:site_name', 'Anacan.az', true);
    updateMetaTag('og:locale', locale === 'az' ? 'az_AZ' : 'ru_RU', true);
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    updateMetaTag('twitter:image', finalImage);
    
    // Additional SEO meta tags
    updateMetaTag('keywords', post ? (post.tags?.map(t => t.name[locale]).join(', ') || '') : 'ana platforması, hamiləlik, uşaq tərbiyəsi');
    updateMetaTag('author', post?.author || 'Anacan.az');
    updateMetaTag('article:published_time', post?.published_at || '');
    updateMetaTag('article:modified_time', post?.updatedAt || post?.published_at || '');
    if (post?.categoryId) {
      updateMetaTag('article:section', '', true); // Will be set dynamically if category is available
    }

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', finalUrl);

    // Update structured data
    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(structuredData);
  }, [finalTitle, finalDescription, finalImage, finalUrl, type, locale, structuredData]);

  return null;
};

export default SEO;

