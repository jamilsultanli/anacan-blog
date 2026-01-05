
export type Locale = 'az' | 'ru';

export interface LocalizedString {
  az: string;
  ru: string;
}

export interface Category {
  id: string;
  slug: string;
  name: LocalizedString;
  color: string;
  icon: string;
}

export interface Tag {
  id: string;
  slug: string;
  name: LocalizedString;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  categoryId: string;
  author: string;
  authorId?: string;
  published_at: string; // ISO Date
  imageUrl: string;
  readTime: number; // minutes
  tags: string[]; // array of tag IDs
  isFeatured: boolean;
  status: 'published' | 'draft' | 'archived';
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// User Types
export type UserRole = 'user' | 'author' | 'admin';

export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  status?: 'active' | 'banned' | 'pending';
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User extends UserProfile {
  email: string;
}

// Comment Types
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user?: UserProfile;
  parentId?: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt?: string;
  replies?: Comment[];
  reactions?: CommentReaction[];
}

export interface CommentReaction {
  id: string;
  commentId: string;
  userId: string;
  reactionType: 'like' | 'love' | 'helpful' | 'laugh' | 'wow' | 'sad' | 'angry';
}

// Interaction Types
export interface PostLike {
  postId: string;
  userId: string;
  createdAt: string;
}

export interface Bookmark {
  postId: string;
  userId: string;
  createdAt: string;
}

export interface ReadingHistory {
  id: string;
  userId: string;
  postId: string;
  readAt: string;
}

// Community Types
export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'post_liked' | 'post_bookmarked' | 'comment_created' | 'post_viewed' | 'followed_user';
  targetId: string; // postId, commentId, or userId depending on type
  targetType: 'post' | 'comment' | 'user';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UserStats {
  postsRead: number;
  commentsMade: number;
  bookmarksCount: number;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
}

// Forum Types
export interface Forum {
  id: string;
  name: LocalizedString;
  slug: string;
  description?: LocalizedString;
  icon?: string;
  color?: string;
  postCount?: number;
  isActive: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ForumPost {
  id: string;
  forumId: string;
  userId: string;
  user?: UserProfile;
  title: string;
  content: string;
  isPinned: boolean;
  isSolved: boolean;
  isClosed?: boolean;
  viewCount: number;
  upvoteCount: number;
  downvoteCount: number;
  replyCount: number;
  lastReplyAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ForumReply {
  id: string;
  forumPostId: string;
  userId: string;
  user?: UserProfile;
  content: string;
  isHelpful: boolean;
  upvoteCount: number;
  parentReplyId?: string; // For nested replies
  replies?: ForumReply[]; // Nested replies
  createdAt?: string;
  updatedAt?: string;
}

export interface ForumVote {
  id: string;
  forumPostId: string;
  userId: string;
  voteType: 'upvote' | 'downvote';
  createdAt: string;
}

// Newsletter Types
export interface NewsletterSubscription {
  id: string;
  email: string;
  name?: string;
  surname?: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
}

// UI & Context Types
export interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Ad Types
export type AdPosition = 'header' | 'sidebar' | 'footer' | 'in-content' | 'hero-center' | 'mobile-banner' | 'native';
export type AdType = 'banner' | 'text' | 'native' | 'video' | 'sponsored';

export interface AdSpace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  position: AdPosition;
  width?: number;
  height?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Ad {
  id: string;
  adSpaceId: string;
  title: string;
  type: AdType;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  clickCount: number;
  impressionCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdClick {
  id: string;
  ad_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  clicked_at: string;
}

export interface Story {
  id: string;
  title?: {
    az?: string;
    ru?: string;
  };
  imageUrl: string;
  linkUrl?: string;
  linkText?: {
    az?: string;
    ru?: string;
  };
  isActive: boolean;
  order?: number;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdImpression {
  id: string;
  ad_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  viewed_at: string;
}
