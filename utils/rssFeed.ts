import { BlogPost } from '../types';

export const generateRSSFeed = (posts: BlogPost[], locale: 'az' | 'ru' = 'az'): string => {
  const baseUrl = 'https://anacan.az';
  const feedUrl = `${baseUrl}/rss.xml`;
  const currentDate = new Date().toUTCString();

  const items = posts
    .slice(0, 20) // Latest 20 posts
    .map(post => {
      const postUrl = `${baseUrl}/blog/${post.slug}`;
      const pubDate = new Date(post.published_at || post.createdAt).toUTCString();
      
      return `
  <item>
    <title><![CDATA[${post.title[locale]}]]></title>
    <link>${postUrl}</link>
    <guid isPermaLink="true">${postUrl}</guid>
    <description><![CDATA[${post.excerpt[locale] || ''}]]></description>
    <pubDate>${pubDate}</pubDate>
    ${post.imageUrl ? `<enclosure url="${post.imageUrl}" type="image/jpeg" />` : ''}
    <category><![CDATA[${post.categoryId || ''}]]></category>
    ${post.tags?.map(tag => `<category><![CDATA[${tag.name[locale]}]]></category>`).join('') || ''}
  </item>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Anacan.az - ${locale === 'az' ? 'Müasir Ana Platforması' : 'Современная Платформа для Мам'}</title>
    <link>${baseUrl}</link>
    <description>${locale === 'az' 
      ? 'Azərbaycanın ən müasir ana platforması. Hamiləlikdən uşaq tərbiyəsinə qədər hər şey burada.' 
      : 'Современная платформа для мам в Азербайджане. Все от беременности до воспитания детей.'}</description>
    <language>${locale === 'az' ? 'az-AZ' : 'ru-RU'}</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <pubDate>${currentDate}</pubDate>
    <ttl>60</ttl>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>Anacan.az</title>
      <link>${baseUrl}</link>
    </image>
    ${items}
  </channel>
</rss>`;
};

