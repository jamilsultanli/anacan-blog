import { BlogPost } from '../types';

export const getRelatedPosts = (
  currentPost: BlogPost,
  allPosts: BlogPost[],
  limit: number = 5
): BlogPost[] => {
  const scoredPosts = allPosts
    .filter(post => post.id !== currentPost.id && post.status === 'published')
    .map(post => ({
      post,
      score: calculateRelevanceScore(currentPost, post),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);

  return scoredPosts;
};

const calculateRelevanceScore = (post1: BlogPost, post2: BlogPost): number => {
  let score = 0;
  const locale: 'az' | 'ru' = 'az'; // or get from context

  // Same category = high score
  if (post1.categoryId === post2.categoryId) {
    score += 50;
  }

  // Common tags = medium score
  const tags1 = post1.tags?.map(t => t.name[locale].toLowerCase()) || [];
  const tags2 = post2.tags?.map(t => t.name[locale].toLowerCase()) || [];
  const commonTags = tags1.filter(tag => tags2.includes(tag));
  score += commonTags.length * 10;

  // Similar title keywords = low score
  const words1 = post1.title[locale].toLowerCase().split(/\s+/);
  const words2 = post2.title[locale].toLowerCase().split(/\s+/);
  const commonWords = words1.filter(word => 
    word.length > 3 && words2.includes(word)
  );
  score += commonWords.length * 5;

  // Recency bonus (newer posts get small boost)
  const daysDiff = (Date.now() - new Date(post2.published_at || post2.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff < 30) {
    score += 5;
  } else if (daysDiff < 90) {
    score += 2;
  }

  // Popularity bonus (high view count = small boost)
  if (post2.viewCount > 1000) {
    score += 3;
  }

  return score;
};

