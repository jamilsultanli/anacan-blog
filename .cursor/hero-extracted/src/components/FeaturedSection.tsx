import { ArrowRight } from 'lucide-react@0.487.0';
import { ArticleCard } from './ArticleCard';

const featuredArticles = [
  {
    image: 'https://images.unsplash.com/photo-1548289227-b7d966b70003?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGJhYnklMjBlYXRpbmd8ZW58MXx8fHwxNzY3NTEwODQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Körpə',
    title: 'Körpə Qidalanması: İlk 6 Ayda Nələrə Diqqət Edilməli?',
    excerpt: 'Ana südü ilə qidalanma və solid qidalara keçid prosesi haqqında ətraflı məlumat',
    author: 'Dr. Ayşən Məmmədova',
    date: '2 gün əvvəl',
    readTime: '5 dəqiqə'
  },
  {
    image: 'https://images.unsplash.com/photo-1758368698083-c72cca26cc7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RoZXIlMjByZWFkaW5nJTIwYmFieXxlbnwxfHx8fDE3Njc1NTA4NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Tərbiyə',
    title: '0-3 Yaş Arası Uşaqlarda Dil İnkişafı və Oxu Aləmi',
    excerpt: 'Uşağınıza kitab oxumağın vacibliyini və düzgün metodları öyrənin',
    author: 'Leyla Həsənova',
    date: '4 gün əvvəl',
    readTime: '7 dəqiqə'
  },
  {
    image: 'https://images.unsplash.com/photo-1610544767321-11acac63fd50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwc21pbGluZyUyMHBvcnRyYWl0fGVufDF8fHx8MTc2NzU1MDg1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Sağlamlıq',
    title: 'Körpələrdə İlk Dişlərin Çıxması: Ağrıları Azaltmaq Yolları',
    excerpt: 'Dişləmə dövrü və bu prosesdə körpəyə necə kömək edə biləcəyiniz',
    author: 'Dr. Nigar Əliyeva',
    date: '1 həftə əvvəl',
    readTime: '6 dəqiqə'
  }
];

export function FeaturedSection() {
  return (
    <section className="w-full bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl text-gray-900">Seçilmiş məqalələr</h2>
          <button className="text-sm text-pink-500 hover:text-pink-600 transition-colors flex items-center gap-2">
            Hamısına bax
            <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredArticles.map((article, index) => (
            <ArticleCard key={index} {...article} />
          ))}
        </div>
      </div>
    </section>
  );
}
