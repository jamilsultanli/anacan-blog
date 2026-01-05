import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BlogCard from '../../components/BlogCard';
import { BlogPost, Category } from '../../types';
import { LanguageProvider } from '../../contexts/LanguageContext';

const mockPost: BlogPost = {
  id: '1',
  slug: 'test-post',
  title: {
    az: 'Test Məqalə',
    ru: 'Тестовая статья',
  },
  excerpt: {
    az: 'Test excerpt',
    ru: 'Тестовое описание',
  },
  content: {
    az: 'Test content',
    ru: 'Тестовое содержимое',
  },
  categoryId: '1',
  author: 'Test Author',
  published_at: new Date().toISOString(),
  imageUrl: 'https://example.com/image.jpg',
  readTime: 5,
  tags: [],
  isFeatured: false,
  status: 'published',
};

const mockCategory: Category = {
  id: '1',
  slug: 'test',
  name: {
    az: 'Test',
    ru: 'Тест',
  },
  icon: '📝',
  color: 'bg-pink-100 text-pink-600',
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </BrowserRouter>
);

describe('BlogCard', () => {
  it('renders post title', () => {
    render(
      <Wrapper>
        <BlogCard post={mockPost} category={mockCategory} />
      </Wrapper>
    );
    expect(screen.getByText('Test Məqalə')).toBeInTheDocument();
  });

  it('renders post excerpt', () => {
    render(
      <Wrapper>
        <BlogCard post={mockPost} category={mockCategory} />
      </Wrapper>
    );
    expect(screen.getByText('Test excerpt')).toBeInTheDocument();
  });

  it('renders category name', () => {
    render(
      <Wrapper>
        <BlogCard post={mockPost} category={mockCategory} />
      </Wrapper>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('has correct link to post', () => {
    render(
      <Wrapper>
        <BlogCard post={mockPost} category={mockCategory} />
      </Wrapper>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/blog/test-post');
  });
});

