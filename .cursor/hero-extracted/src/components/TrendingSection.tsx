import { ArrowRight } from 'lucide-react@0.487.0';
import { ArticleCard } from './ArticleCard';

const trendingArticles = [
  {
    image: 'https://images.unsplash.com/photo-1764665724304-373c24bcca2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXdib3JuJTIwc2xlZXBpbmclMjBwZWFjZWZ1bHxlbnwxfHx8fDE3Njc1NTA4NTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Körpə',
    title: 'Hamiləliyin İlk 3 Ayında Nələr Baş Verir? İlk Trimestri Addım-Addım',
    author: 'Məlahət İbrahimova',
    date: '1 gün əvvəl',
    readTime: '8 dəqiqə'
  },
  {
    image: 'https://images.unsplash.com/photo-1767082237660-12ab53e39aec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBwbGF5aW5nJTIwY2hpbGRyZW58ZW58MXx8fHwxNzY3NTUwODU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Tərbiyə',
    title: 'Yeni Doğulan Körpə Baxımı: İlk 30 Günün Əsas Qaydaları',
    author: 'Gülnar Qasımova',
    date: '3 gün əvvəl',
    readTime: '10 dəqiqə'
  },
  {
    image: 'https://images.unsplash.com/photo-1767411972614-94fec78ca76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RoZXIlMjBiYWJ5JTIwYm9uZGluZ3xlbnwxfHx8fDE3Njc1MDg3NjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Sağlamlıq',
    title: '0-6 Ay Arası Körpələrdə Yuxu Rejimi və Yuxu Problemləri',
    author: 'Dr. Səbinə Rəhimova',
    date: '5 gün əvvəl',
    readTime: '12 dəqiqə'
  },
  {
    image: 'https://images.unsplash.com/photo-1706087959729-229f304e92c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwcHJlZ25hbnQlMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2NzU0OTU4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Hamiləlik',
    title: 'Hamiləlikdə Sağlam Qidalanma Planı və Vitamin Qəbulu',
    author: 'Nuranə Əhmədova',
    date: '1 həftə əvvəl',
    readTime: '9 dəqiqə'
  },
  {
    image: 'https://images.unsplash.com/photo-1575883107884-4735c43fc29c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHdlbGxuZXNzJTIwc2VsZiUyMGNhcmV8ZW58MXx8fHwxNzY3NTQ5NTg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Özünə Qulluq',
    title: 'Doğuşdan Sonra Özünə Qulluq: Ana Sağlamlığı İlk Planda',
    author: 'Ləman Həsənova',
    date: '1 həftə əvvəl',
    readTime: '7 dəqiqə'
  },
  {
    image: 'https://images.unsplash.com/photo-1763013259158-8a8370542ddb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJlbnRpbmclMjBlZHVjYXRpb24lMjBjaGlsZHJlbnxlbnwxfHx8fDE3Njc1NDk1ODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Psixologiya',
    title: 'Doğuşdan Sonra Depressiya: Nişanələr və Müalicə Yolları',
    author: 'Psixoloq Arzu Məmmədova',
    date: '2 həftə əvvəl',
    readTime: '11 dəqiqə'
  }
];

export function TrendingSection() {
  return (
    <section className="w-full bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl text-gray-900">Trend məqalələr</h2>
          <button className="text-sm text-pink-500 hover:text-pink-600 transition-colors flex items-center gap-2">
            Hamısına bax
            <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingArticles.map((article, index) => (
            <ArticleCard key={index} {...article} />
          ))}
        </div>
      </div>
    </section>
  );
}
