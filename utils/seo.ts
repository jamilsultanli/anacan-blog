import { BlogPost, Category, Page } from '../types';

// Get base URL dynamically (for localhost and production)
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://anacan.az';
};

const BASE_URL = getBaseUrl();

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  'xhtml:link'?: Array<{ rel: 'alternate'; hreflang: string; href: string }>;
}

/**
 * Generate sitemap index that references language-specific sitemaps
 */
export const generateSitemapIndex = (baseUrl?: string): string => {
  const currentDate = new Date().toISOString().split('T')[0];
  const url = baseUrl || BASE_URL;

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
              xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <sitemap>
    <loc>${url}/sitemap-az.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${url}/sitemap-ru.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;
};

/**
 * Generate language-specific sitemap
 */
export const generateLanguageSitemap = (
  locale: 'az' | 'ru',
  posts: BlogPost[],
  categories: Category[],
  pages: Page[],
  baseUrl?: string,
  forums?: Forum[],
  forumPosts?: ForumPost[]
): string => {
  const currentDate = new Date().toISOString().split('T')[0];
  const url = baseUrl || BASE_URL;
  const urls: SitemapUrl[] = [];

  // Homepage - highest priority
  urls.push({
    loc: url,
    changefreq: 'daily',
    priority: '1.0',
    'xhtml:link': [
      { rel: 'alternate', hreflang: 'az', href: `${url}?lang=az` },
      { rel: 'alternate', hreflang: 'ru', href: `${url}?lang=ru` },
      { rel: 'alternate', hreflang: 'x-default', href: url },
    ],
  });

  // Blog listing page
  urls.push({
    loc: `${url}/blog`,
    changefreq: 'daily',
    priority: '0.8',
    'xhtml:link': [
      { rel: 'alternate', hreflang: 'az', href: `${url}/blog?lang=az` },
      { rel: 'alternate', hreflang: 'ru', href: `${url}/blog?lang=ru` },
      { rel: 'alternate', hreflang: 'x-default', href: `${url}/blog` },
    ],
  });

  // Categories - high priority
  categories.forEach(category => {
    urls.push({
      loc: `${url}/category/${category.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
      'xhtml:link': [
        { rel: 'alternate', hreflang: 'az', href: `${url}/category/${category.slug}?lang=az` },
        { rel: 'alternate', hreflang: 'ru', href: `${url}/category/${category.slug}?lang=ru` },
        { rel: 'alternate', hreflang: 'x-default', href: `${url}/category/${category.slug}` },
      ],
    });
  });

  // Blog posts - priority based on featured status and recency
  posts.forEach(post => {
    // Featured posts get higher priority
    const priority = post.isFeatured ? '1.0' : '0.9';
    const lastmod = post.updatedAt || post.published_at || post.createdAt;
    
    urls.push({
      loc: `${url}/blog/${post.slug}`,
      changefreq: 'monthly',
      priority,
      lastmod: lastmod ? new Date(lastmod).toISOString().split('T')[0] : currentDate,
      'xhtml:link': [
        { rel: 'alternate', hreflang: 'az', href: `${url}/blog/${post.slug}?lang=az` },
        { rel: 'alternate', hreflang: 'ru', href: `${url}/blog/${post.slug}?lang=ru` },
        { rel: 'alternate', hreflang: 'x-default', href: `${url}/blog/${post.slug}` },
      ],
    });
  });

  // Static pages - medium priority
  pages.forEach(page => {
    if (page.isPublished) {
      urls.push({
        loc: `${url}/${page.slug}`,
        changefreq: 'monthly',
        priority: '0.7',
        lastmod: page.updatedAt || page.createdAt || currentDate,
        'xhtml:link': [
          { rel: 'alternate', hreflang: 'az', href: `${url}/${page.slug}?lang=az` },
          { rel: 'alternate', hreflang: 'ru', href: `${url}/${page.slug}?lang=ru` },
          { rel: 'alternate', hreflang: 'x-default', href: `${url}/${page.slug}` },
        ],
      });
    }
  });

  // Forums listing page
  urls.push({
    loc: `${url}/forums`,
    changefreq: 'daily',
    priority: '0.8',
    'xhtml:link': [
      { rel: 'alternate', hreflang: 'az', href: `${url}/forums?lang=az` },
      { rel: 'alternate', hreflang: 'ru', href: `${url}/forums?lang=ru` },
      { rel: 'alternate', hreflang: 'x-default', href: `${url}/forums` },
    ],
  });

  // Forum categories
  if (forums) {
    forums.forEach(forum => {
      if (forum.isActive) {
        urls.push({
          loc: `${url}/forum/${forum.slug}`,
          changefreq: 'daily',
          priority: '0.8',
          lastmod: forum.updatedAt || forum.createdAt || currentDate,
          'xhtml:link': [
            { rel: 'alternate', hreflang: 'az', href: `${url}/forum/${forum.slug}?lang=az` },
            { rel: 'alternate', hreflang: 'ru', href: `${url}/forum/${forum.slug}?lang=ru` },
            { rel: 'alternate', hreflang: 'x-default', href: `${url}/forum/${forum.slug}` },
          ],
        });
      }
    });
  }

  // Forum posts
  if (forumPosts) {
    forumPosts.forEach(forumPost => {
      // Get forum slug - we need to find it from forums array
      const forum = forums?.find(f => f.id === forumPost.forumId);
      if (forum) {
        urls.push({
          loc: `${url}/forum/${forum.slug}/${forumPost.id}`,
          changefreq: 'weekly',
          priority: '0.7',
          lastmod: forumPost.updatedAt || forumPost.createdAt || currentDate,
          'xhtml:link': [
            { rel: 'alternate', hreflang: 'az', href: `${url}/forum/${forum.slug}/${forumPost.id}?lang=az` },
            { rel: 'alternate', hreflang: 'ru', href: `${url}/forum/${forum.slug}/${forumPost.id}?lang=ru` },
            { rel: 'alternate', hreflang: 'x-default', href: `${url}/forum/${forum.slug}/${forumPost.id}` },
          ],
        });
      }
    });
  }

  // Build XML
  const urlEntries = urls.map(url => {
    const xhtmlLinks = url['xhtml:link']
      ? url['xhtml:link']
          .map(link => `    <xhtml:link rel="${link.rel}" hreflang="${link.hreflang}" href="${link.href}" />`)
          .join('\n')
      : '';

    return `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod || currentDate}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>${xhtmlLinks ? '\n' + xhtmlLinks : ''}
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join('\n')}
</urlset>`;
};

/**
 * Legacy function for backward compatibility
 */
export const generateSitemap = (posts: BlogPost[], categories: Category[]): string => {
  return generateLanguageSitemap('az', posts, categories, []);
};

/**
 * Generate robots.txt
 */
export const generateRobotsTxt = (): string => {
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /profile/
Disallow: /login
Disallow: /signup
Disallow: /forgot-password

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap-az.xml
Sitemap: ${BASE_URL}/sitemap-ru.xml
`;
};
