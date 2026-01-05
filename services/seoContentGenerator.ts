import { 
  generateSEOContent, 
  optimizeMetaDescription, 
  optimizeTitle, 
  generateKeywords,
  analyzeContentSEO,
  generateTitleOptions,
  generateFullBlogPost,
  SEOContentRequest,
  SEOContentResponse,
  BlogTitleOption,
  FullBlogPostResponse
} from './geminiService';
import { BlogPost, LocalizedString } from '../types';

export interface SEOOptimizationResult {
  score: number;
  issues: string[];
  suggestions: string[];
  optimizedTitle?: LocalizedString;
  optimizedMetaDescription?: LocalizedString;
  suggestedKeywords?: string[];
}

class SEOContentGeneratorService {
  async generateFullPost(request: SEOContentRequest): Promise<SEOContentResponse> {
    return await generateSEOContent(request);
  }

  async generateTitleOptions(topic: string, locale: 'az' | 'ru'): Promise<BlogTitleOption[]> {
    return await generateTitleOptions(topic, locale);
  }

  async generateFullBlogPost(
    topic: string,
    selectedTitle: string,
    focusKeyword: string,
    locale: 'az' | 'ru',
    targetLength?: number
  ): Promise<FullBlogPostResponse> {
    return await generateFullBlogPost(topic, selectedTitle, focusKeyword, locale, targetLength);
  }

  async optimizeExistingPost(
    post: BlogPost,
    locale: 'az' | 'ru'
  ): Promise<SEOOptimizationResult> {
    const content = post.content[locale];
    const title = post.title[locale];
    const metaDescription = post.excerpt[locale] || '';

    // Analyze current SEO
    const analysis = await analyzeContentSEO(content, title, metaDescription, locale);

    // Generate optimized versions
    const optimizedTitle = await optimizeTitle(title, locale);
    const optimizedMeta = await optimizeMetaDescription(content, locale);
    const keywords = await generateKeywords(title, locale);

    return {
      ...analysis,
      optimizedTitle: locale === 'az' 
        ? { az: optimizedTitle, ru: post.title.ru }
        : { az: post.title.az, ru: optimizedTitle },
      optimizedMetaDescription: locale === 'az'
        ? { az: optimizedMeta, ru: post.excerpt.ru }
        : { az: post.excerpt.az, ru: optimizedMeta },
      suggestedKeywords: keywords,
    };
  }

  async generateMetaTags(
    title: string,
    content: string,
    locale: 'az' | 'ru',
    keywords?: string[]
  ): Promise<{
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  }> {
    const [optimizedTitle, metaDescription, generatedKeywords] = await Promise.all([
      optimizeTitle(title, locale, keywords),
      optimizeMetaDescription(content, locale, keywords),
      keywords && keywords.length > 0 ? Promise.resolve(keywords) : generateKeywords(title, locale)
    ]);

    return {
      metaTitle: optimizedTitle,
      metaDescription,
      keywords: generatedKeywords,
    };
  }

  async enhanceContent(
    content: string,
    locale: 'az' | 'ru',
    targetKeywords?: string[]
  ): Promise<string> {
    // This would use Gemini to enhance content with better SEO
    // For now, return original content
    return content;
  }
}

export const seoContentGenerator = new SEOContentGeneratorService();
