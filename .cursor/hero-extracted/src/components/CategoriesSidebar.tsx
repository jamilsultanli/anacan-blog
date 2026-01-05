import { Heart, Baby, Book, Apple, Sparkles, Smile, Users, MessageCircle } from 'lucide-react@0.487.0';

const categories = [
  { name: 'Hamiləlik', icon: Heart, count: 248, color: 'bg-pink-100 text-pink-600' },
  { name: 'Körpə', icon: Baby, count: 182, color: 'bg-purple-100 text-purple-600' },
  { name: 'Tərbiyə', icon: Book, count: 156, color: 'bg-blue-100 text-blue-600' },
  { name: 'Qidalanma', icon: Apple, count: 124, color: 'bg-green-100 text-green-600' },
  { name: 'Özünə Qulluq', icon: Sparkles, count: 98, color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Sağlamlıq', icon: Smile, count: 87, color: 'bg-red-100 text-red-600' },
  { name: 'Sosiallaşma', icon: Users, count: 64, color: 'bg-indigo-100 text-indigo-600' },
  { name: 'Psixologiya', icon: MessageCircle, count: 52, color: 'bg-teal-100 text-teal-600' },
];

export function CategoriesSidebar() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-6">
      <h3 className="text-lg text-gray-900 mb-4">Kateqoriyalar</h3>
      
      <div className="space-y-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.name}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${category.color}`}>
                  <Icon size={16} />
                </div>
                <span className="text-sm text-gray-700 group-hover:text-pink-500 transition-colors">
                  {category.name}
                </span>
              </div>
              <span className="text-xs text-gray-400">{category.count}</span>
            </button>
          );
        })}
      </div>
      
      {/* Newsletter */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-sm text-gray-900 mb-2">Yeni məqalələrdən xəbərdar olun</h4>
        <p className="text-xs text-gray-600 mb-3">
          E-mail ünvanınızı daxil edin və yeni məqalələrdən ilk siz xəbərdar olun
        </p>
        <input 
          type="email"
          placeholder="E-mail"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent mb-2"
        />
        <button className="w-full px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
          Abunə ol
        </button>
      </div>
    </div>
  );
}
