import { BlogPost, LocalizedString } from '../types';

export interface SEOScoreFactors {
  titleLength: number;
  titleScore: number;
  metaDescriptionLength: number;
  metaDescriptionScore: number;
  contentLength: number;
  contentScore: number;
  headingStructure: number;
  imageAltText: number;
  internalLinks: number;
  keywordDensity: number;
  readability: number;
}

export interface SEOScoreResult {
  totalScore: number;
  factors: SEOScoreFactors;
  recommendations: string[];
}

export function calculateSEOScore(
  post: BlogPost,
  locale: 'az' | 'ru',
  focusKeyword?: string
): SEOScoreResult {
  const title = post.title[locale];
  const metaDescription = post.excerpt[locale] || '';
  const content = post.content[locale];

  const factors: SEOScoreFactors = {
    titleLength: title.length,
    titleScore: calculateTitleScore(title, focusKeyword),
    metaDescriptionLength: metaDescription.length,
    metaDescriptionScore: calculateMetaDescriptionScore(metaDescription, focusKeyword),
    contentLength: content.length,
    contentScore: calculateContentScore(content),
    headingStructure: analyzeHeadingStructure(content),
    imageAltText: post.imageUrl ? 10 : 0, // Basic check
    internalLinks: countInternalLinks(content),
    keywordDensity: focusKeyword ? calculateKeywordDensity(content, focusKeyword) : 0,
    readability: calculateReadability(content, locale),
  };

  const totalScore = Math.round(
    (factors.titleScore * 0.15 +
    factors.metaDescriptionScore * 0.15 +
    factors.contentScore * 0.20 +
    factors.headingStructure * 0.10 +
    factors.imageAltText * 0.10 +
    factors.internalLinks * 0.10 +
    factors.keywordDensity * 0.10 +
    factors.readability * 0.10)
  );

  const recommendations = generateRecommendations(factors, locale);

  return {
    totalScore: Math.min(100, Math.max(0, totalScore)),
    factors,
    recommendations,
  };
}

function calculateTitleScore(title: string, keyword?: string): number {
  let score = 0;
  
  // Length check (50-60 chars optimal)
  if (title.length >= 50 && title.length <= 60) {
    score += 30;
  } else if (title.length >= 40 && title.length <= 70) {
    score += 20;
  } else {
    score += 10;
  }

  // Keyword in title
  if (keyword && title.toLowerCase().includes(keyword.toLowerCase())) {
    score += 40;
  }

  // Title at beginning
  if (keyword && title.toLowerCase().startsWith(keyword.toLowerCase())) {
    score += 30;
  }

  return Math.min(100, score);
}

function calculateMetaDescriptionScore(meta: string, keyword?: string): number {
  let score = 0;
  
  // Length check (150-160 chars optimal)
  if (meta.length >= 150 && meta.length <= 160) {
    score += 40;
  } else if (meta.length >= 120 && meta.length <= 170) {
    score += 30;
  } else if (meta.length > 0) {
    score += 20;
  }

  // Keyword in description
  if (keyword && meta.toLowerCase().includes(keyword.toLowerCase())) {
    score += 40;
  }

  // Call to action
  if (meta.match(/daha|daha çox|oxu|öyrən|tap|al/i)) {
    score += 20;
  }

  return Math.min(100, score);
}

function calculateContentScore(content: string): number {
  let score = 0;
  
  // Content length (300+ words optimal)
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 300) {
    score += 40;
  } else if (wordCount >= 200) {
    score += 30;
  } else if (wordCount >= 100) {
    score += 20;
  } else {
    score += 10;
  }

  // Paragraph structure
  const paragraphs = content.split(/\n\n/).filter(p => p.trim().length > 0);
  if (paragraphs.length >= 3) {
    score += 30;
  }

  // Has lists
  if (content.match(/^[-*•]\s/m)) {
    score += 15;
  }

  // Has questions
  if (content.match(/\?/)) {
    score += 15;
  }

  return Math.min(100, score);
}

function analyzeHeadingStructure(content: string): number {
  let score = 0;
  
  const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
  const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (content.match(/<h3[^>]*>/gi) || []).length;

  // Has H1
  if (h1Count === 1) {
    score += 30;
  } else if (h1Count > 1) {
    score += 10; // Multiple H1s is not ideal
  }

  // Has H2s
  if (h2Count >= 2) {
    score += 40;
  } else if (h2Count >= 1) {
    score += 20;
  }

  // Has H3s
  if (h3Count >= 1) {
    score += 30;
  }

  return Math.min(100, score);
}

function countInternalLinks(content: string): number {
  const linkMatches = content.match(/<a[^>]+href=["'](?!https?:\/\/)/gi) || [];
  return Math.min(100, linkMatches.length * 20);
}

function calculateKeywordDensity(content: string, keyword: string): number {
  const words = content.toLowerCase().split(/\s+/);
  const keywordLower = keyword.toLowerCase();
  const keywordCount = words.filter(w => w.includes(keywordLower)).length;
  const density = (keywordCount / words.length) * 100;
  
  // Optimal density: 1-2%
  if (density >= 1 && density <= 2) {
    return 100;
  } else if (density >= 0.5 && density <= 3) {
    return 70;
  } else if (density > 0) {
    return 40;
  }
  return 0;
}

function calculateReadability(content: string, locale: 'az' | 'ru'): number {
  // Simple readability check based on sentence length and word length
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/);
  
  if (sentences.length === 0) return 50;
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  
  let score = 50;
  
  // Optimal: 15-20 words per sentence
  if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
    score += 30;
  } else if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) {
    score += 20;
  }
  
  // Optimal: 4-5 chars per word
  if (avgWordLength >= 4 && avgWordLength <= 5) {
    score += 20;
  }
  
  return Math.min(100, score);
}

function generateRecommendations(factors: SEOScoreFactors, locale: 'az' | 'ru'): string[] {
  const recommendations: string[] = [];
  const lang = locale === 'az' ? 'azərbaycan' : 'rus';

  if (factors.titleScore < 70) {
    if (factors.titleLength < 50) {
      recommendations.push(`Başlıq çox qısadır. Ən azı 50 simvol olmalıdır.`);
    } else if (factors.titleLength > 60) {
      recommendations.push(`Başlıq çox uzundur. 60 simvoldan çox olmamalıdır.`);
    }
  }

  if (factors.metaDescriptionScore < 70) {
    if (factors.metaDescriptionLength < 150) {
      recommendations.push(`Meta description çox qısadır. 150-160 simvol optimaldır.`);
    } else if (factors.metaDescriptionLength > 160) {
      recommendations.push(`Meta description çox uzundur. 160 simvoldan çox olmamalıdır.`);
    }
  }

  if (factors.contentLength < 2000) {
    recommendations.push(`Məzmun daha uzun olmalıdır. Ən azı 300 söz tövsiyə olunur.`);
  }

  if (factors.headingStructure < 50) {
    recommendations.push(`Başlıq strukturu yaxşılaşdırılmalıdır. H2 və H3 başlıqları əlavə edin.`);
  }

  if (factors.imageAltText === 0) {
    recommendations.push(`Şəkillərə alt text əlavə edin.`);
  }

  if (factors.internalLinks < 20) {
    recommendations.push(`Daxili linklər əlavə edin.`);
  }

  if (factors.keywordDensity === 0) {
    recommendations.push(`Açar söz sıxlığını artırın.`);
  }

  return recommendations;
}

