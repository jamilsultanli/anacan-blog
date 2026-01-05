import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { postsService } from '../services/api/posts';
import { categoriesService } from '../services/api/categories';
import { pagesService } from '../services/api/pages';
import { generateSitemapIndex, generateLanguageSitemap } from '../utils/seo';

const SitemapPage: React.FC = () => {
  const location = useLocation();
  const [sitemapXml, setSitemapXml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generate = async () => {
      try {
        setLoading(true);
        
        // Get base URL for localhost support
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://anacan.az';
        
        // Check if this is a language-specific sitemap or index
        const path = location.pathname;
        
        if (path === '/sitemap.xml' || path === '/sitemap') {
          // Generate sitemap index with current base URL
          const xml = generateSitemapIndex(baseUrl);
          setSitemapXml(xml);
        } else if (path === '/sitemap-az.xml' || path === '/sitemap-az') {
          // Generate Azerbaijani sitemap
          const { forumsService } = await import('../services/api/forums');
          const { databases, DATABASE_ID, COLLECTIONS, Query } = await import('../services/appwrite');
          
          const [postsResponse, categoriesResponse, pagesResponse, forumsResponse, forumPostsResponse] = await Promise.all([
            postsService.getPosts({ status: 'published', limit: 10000 }),
            categoriesService.getCategories(),
            pagesService.getPages(true), // Only published pages
            forumsService.getForums(true), // Only active forums
            databases.listDocuments(DATABASE_ID, COLLECTIONS.FORUM_POSTS, [Query.limit(10000)]),
          ]);

          const posts = postsResponse.data || [];
          const categories = categoriesResponse.data || [];
          const pages = pagesResponse.data || [];
          const forums = forumsResponse.data || [];
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
          
          const xml = generateLanguageSitemap('az', posts, categories, pages, baseUrl, forums, forumPosts);
          setSitemapXml(xml);
        } else if (path === '/sitemap-ru.xml' || path === '/sitemap-ru') {
          // Generate Russian sitemap
          const { forumsService } = await import('../services/api/forums');
          const { databases, DATABASE_ID, COLLECTIONS, Query } = await import('../services/appwrite');
          
          const [postsResponse, categoriesResponse, pagesResponse, forumsResponse, forumPostsResponse] = await Promise.all([
            postsService.getPosts({ status: 'published', limit: 10000 }),
            categoriesService.getCategories(),
            pagesService.getPages(true), // Only published pages
            forumsService.getForums(true), // Only active forums
            databases.listDocuments(DATABASE_ID, COLLECTIONS.FORUM_POSTS, [Query.limit(10000)]),
          ]);

          const posts = postsResponse.data || [];
          const categories = categoriesResponse.data || [];
          const pages = pagesResponse.data || [];
          const forums = forumsResponse.data || [];
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
          
          const xml = generateLanguageSitemap('ru', posts, categories, pages, baseUrl, forums, forumPosts);
          setSitemapXml(xml);
        } else {
          // Default to index
          const xml = generateSitemapIndex(baseUrl);
          setSitemapXml(xml);
        }
      } catch (error) {
        console.error('Error generating sitemap:', error);
        // Fallback to basic sitemap
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://anacan.az';
        setSitemapXml(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [location.pathname]);

  // Set proper content type for XML
  useEffect(() => {
    if (sitemapXml && !loading && typeof document !== 'undefined') {
      // Try to set content type via meta tag
      let meta = document.querySelector('meta[http-equiv="Content-Type"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('http-equiv', 'Content-Type');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', 'application/xml; charset=utf-8');
    }
  }, [sitemapXml, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sitemap yüklənir...</p>
        </div>
      </div>
    );
  }

  // Return XML as plain text - browser will display it as XML
  return (
    <pre 
      style={{ 
        margin: 0,
        padding: '1rem',
        backgroundColor: '#fff',
        fontFamily: 'monospace',
        fontSize: '12px',
        whiteSpace: 'pre-wrap',
        overflow: 'auto',
        wordWrap: 'break-word'
      }}
    >
      {sitemapXml}
    </pre>
  );
};

export default SitemapPage;
