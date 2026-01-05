import { ArticleCard } from './ArticleCard';
import { CategoriesSidebar } from './CategoriesSidebar';

const latestArticles = [
  {
    image: 'https://images.unsplash.com/photo-1741573379385-6458156e5f3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RoZXIlMjBiYWJ5JTIwdGVuZGVyJTIwbW9tZW50fGVufDF8fHx8MTc2NzU0OTU4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Hamiləlik',
    title: 'Ana Südünün Artımı Üçün 10 Qızıl Məsləhət',
    excerpt: 'Emzirmə dövrü ilə bağlı suallarınıza cavablar və faydalı tövsiyələr. Ana südünün artırılması üçün effektiv metodlar.',
    author: 'Mehriban Əliyeva',
    date: '2 saat əvvəl',
    readTime: '5 dəqiqə'
  },
  {
    image: 'https://images.unsplash.com/photo-1734607404585-bd97529f1f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwcHJlZ25hbmN5JTIwbnV0cml0aW9ufGVufDF8fHx8MTc2NzU0OTA2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Sağlamlıq',
    title: 'Yeniyetmə Analarının Kabus: İlk 30 Gün Hər Şey Normal Gedib',
    excerpt: 'Doğuşdan sonrakı ilk ayda qarşılaşa biləcəyiniz çətinliklər və onların həlli yolları.',
    author: 'Dr. Könül Məmmədova',
    date: '5 saat əvvəl',
    readTime: '8 dəqiqə'
  },
  {
    image: 'https://images.unsplash.com/photo-1756367141155-487da3717d54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXdib3JuJTIwYmFieSUyMGdlbnRsZXxlbnwxfHx8fDE3Njc1NDk1ODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Körpə',
    title: 'Hamiləliyin İlk 12 Həftəlik Müavinə Səliqəsi İlə Başlanır',
    excerpt: 'Hamiləliyin ilk trimestrində gözlənilən dəyişikliklər və önəmli məlumatlar.',
    author: 'Aysel İbrahimova',
    date: '8 saat əvvəl',
    readTime: '6 dəqiqə'
  }
];

export function LatestSection() {
  return (
    <section className="w-full bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl text-gray-900 mb-8">Ən son məqalələr</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Articles List */}
          <div className="lg:col-span-2 space-y-4">
            {latestArticles.map((article, index) => (
              <ArticleCard key={index} {...article} variant="horizontal" />
            ))}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CategoriesSidebar />
          </div>
        </div>
      </div>
    </section>
  );
}
