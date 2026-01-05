
import React, { useEffect } from 'react';
import { BlogPost } from '../types';
import { UI_STRINGS } from '../constants';

interface PostDetailProps {
  post: BlogPost;
  onBack: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <article className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center text-pink-600 font-bold mb-8 hover:translate-x-[-4px] transition-transform"
      >
        ← {UI_STRINGS.backToBlog}
      </button>

      <header className="mb-12">
        <div className="flex items-center space-x-2 text-pink-600 font-bold text-sm mb-4 uppercase tracking-widest">
          <span>{post.category}</span>
          <span>•</span>
          <span className="text-gray-400">{post.readTime} oxuma</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-8">
          {post.title}
        </h1>
        <div className="flex items-center space-x-4 border-b border-gray-100 pb-8">
          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-lg">
            {post.author[0]}
          </div>
          <div>
            <p className="font-bold text-gray-900">{post.author}</p>
            <p className="text-gray-500 text-sm">{post.date}</p>
          </div>
        </div>
      </header>

      <div className="rounded-3xl overflow-hidden shadow-2xl mb-12">
        <img src={post.imageUrl} alt={post.title} className="w-full aspect-video object-cover" />
      </div>

      <div className="prose prose-lg prose-pink max-w-none text-gray-700 leading-relaxed space-y-6">
        {post.content.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="whitespace-pre-wrap">{paragraph}</p>
        ))}
      </div>

      <footer className="mt-20 pt-12 border-t border-gray-100">
        <div className="bg-pink-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Bu məqaləni bəyəndiniz?</h3>
            <p className="text-gray-600">Daha çox belə faydalı məlumat üçün bizi izləməyə davam edin.</p>
          </div>
          <button className="bg-pink-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-pink-700 transition-all">
            Paylaş
          </button>
        </div>
      </footer>
    </article>
  );
};

export default PostDetail;
