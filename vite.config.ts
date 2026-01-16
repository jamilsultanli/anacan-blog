import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { Client, Databases, Query } from 'node-appwrite';

// Plugin to handle sitemap XML files
function sitemapPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'sitemap-xml-handler',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url;
        
        // Check if it's a sitemap request
        if (url === '/sitemap.xml' || url === '/sitemap-az.xml' || url === '/sitemap-ru.xml') {
          try {
            // Get base URL from request
            const host = req.headers.host || 'localhost:3000';
            const protocol = req.headers['x-forwarded-proto'] 
              ? (req.headers['x-forwarded-proto'] as string).split(',')[0].trim()
              : 'http';
            const baseUrl = `${protocol}://${host}`;
            
            // Initialize Appwrite client for server-side
            const endpoint = env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
            const projectId = env.VITE_APPWRITE_PROJECT_ID || '69580ea2002ecc4ff8e1';
            const databaseId = env.VITE_APPWRITE_DATABASE_ID || 'anacan';
            
            const client = new Client()
              .setEndpoint(endpoint)
              .setProject(projectId);
            
            const databases = new Databases(client);
            
            // Import sitemap generation functions
            const { generateSitemapIndex, generateLanguageSitemap } = await import('./utils/seo');
            
            let xml = '';
            
            if (url === '/sitemap.xml') {
              xml = generateSitemapIndex(baseUrl);
            } else if (url === '/sitemap-az.xml' || url === '/sitemap-ru.xml') {
              const locale = url === '/sitemap-az.xml' ? 'az' : 'ru';
              
              // Fetch data directly from Appwrite
              const [postsResponse, categoriesResponse, pagesResponse, forumsResponse, forumPostsResponse] = await Promise.all([
                databases.listDocuments(databaseId, 'posts', [
                  Query.equal('status', 'published'),
                  Query.orderDesc('$createdAt'),
                  Query.limit(10000)
                ]),
                databases.listDocuments(databaseId, 'categories', [
                  Query.orderAsc('$createdAt')
                ]),
                databases.listDocuments(databaseId, 'pages', [
                  Query.equal('is_published', true),
                  Query.orderAsc('order')
                ]),
                databases.listDocuments(databaseId, 'forums', [
                  Query.equal('is_active', true),
                  Query.orderAsc('order')
                ]),
                databases.listDocuments(databaseId, 'forum_posts', [
                  Query.limit(10000)
                ])
              ]);
              
              // Transform Appwrite documents to our types
              const posts = (postsResponse.documents || []).map((doc: any) => ({
                id: doc.$id,
                slug: doc.slug,
                title: { az: doc.title_az, ru: doc.title_ru },
                excerpt: { az: doc.excerpt_az || '', ru: doc.excerpt_ru || '' },
                content: { az: doc.content_az || '', ru: doc.content_ru || '' },
                categoryId: doc.category_id,
                author: doc.author_name || '',
                published_at: doc.published_at,
                imageUrl: doc.image_url || '',
                readTime: doc.read_time || 5,
                isFeatured: doc.is_featured || false,
                status: doc.status,
                viewCount: doc.view_count || 0,
                createdAt: doc.$createdAt,
                updatedAt: doc.$updatedAt,
              }));
              
              const categories = (categoriesResponse.documents || []).map((doc: any) => ({
                id: doc.$id,
                slug: doc.slug,
                name: { az: doc.name_az, ru: doc.name_ru },
                icon: doc.icon,
                color: doc.color,
              }));
              
              const pages = (pagesResponse.documents || []).map((doc: any) => ({
                id: doc.$id,
                slug: doc.slug,
                title: { az: doc.title_az, ru: doc.title_ru },
                content: { az: doc.content_az || '', ru: doc.content_ru || '' },
                isPublished: doc.is_published,
                order: doc.order,
                createdAt: doc.$createdAt,
                updatedAt: doc.$updatedAt,
              }));
              
              const forums = (forumsResponse.documents || []).map((doc: any) => ({
                id: doc.$id,
                name: { az: doc.name_az, ru: doc.name_ru },
                slug: doc.slug,
                description: doc.description_az || doc.description_ru
                  ? { az: doc.description_az || '', ru: doc.description_ru || '' }
                  : undefined,
                icon: doc.icon,
                color: doc.color,
                isActive: doc.is_active !== false,
                order: doc.order,
                postCount: 0,
                createdAt: doc.$createdAt,
                updatedAt: doc.$updatedAt,
              }));
              
              const forumPosts = (forumPostsResponse.documents || []).map((doc: any) => ({
                id: doc.$id,
                forumId: doc.forum_id,
                userId: doc.user_id,
                title: doc.title,
                content: doc.content,
                isPinned: doc.is_pinned || false,
                isSolved: doc.is_solved || false,
                isClosed: doc.is_closed || false,
                viewCount: doc.view_count || 0,
                upvoteCount: doc.upvote_count || 0,
                downvoteCount: doc.downvote_count || 0,
                replyCount: doc.reply_count || 0,
                lastReplyAt: doc.last_reply_at,
                createdAt: doc.$createdAt,
                updatedAt: doc.$updatedAt,
              }));
              
              xml = generateLanguageSitemap(locale, posts, categories, pages, baseUrl, forums, forumPosts);
            }
            
            // Set proper headers for XML
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
            res.statusCode = 200;
            res.end(xml);
            return;
          } catch (error) {
            console.error('Error generating sitemap:', error);
            // Fallback XML
            const baseUrl = req.headers.host 
              ? `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`
              : 'https://anacan.az';
            const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            res.statusCode = 200;
            res.end(fallbackXml);
            return;
          }
        }
        
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), sitemapPlugin(env)],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Vendor chunks
              if (id.includes('node_modules')) {
                // React vendor
                if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                  return 'react-vendor';
                }
                // Editor vendor - lazy loaded only when needed (admin routes)
                if (id.includes('@tiptap') || id.includes('prosemirror')) {
                  return 'editor-vendor';
                }
                // Appwrite vendor
                if (id.includes('appwrite')) {
                  return 'appwrite-vendor';
                }
                return 'vendor';
              }
              // Don't create editor chunk unless it's actually used
              if (id.includes('admin') && (id.includes('PostEditor') || id.includes('RichTextEditor'))) {
                return 'editor-vendor';
              }
            },
          },
        },
        chunkSizeWarningLimit: 1000,
        cssCodeSplit: true,
        cssMinify: 'lightningcss',
        assetsInlineLimit: 4096, // 4kb
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
            drop_debugger: mode === 'production',
            pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
          },
        },
        sourcemap: mode === 'development',
      },
    };
});
