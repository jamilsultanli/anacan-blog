import { Search, User } from 'lucide-react@0.487.0';
import heroImage from 'figma:asset/190b39e94cb765b1be974d71e3cc4c2cc8886a36.png';

export function ModernNavigation() {
  return (
    <nav className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-lg text-gray-900">Anacan<span className="text-pink-500">.az</span></span>
          </div>

          {/* Center Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-gray-700 hover:text-pink-500 transition-colors">
              Ana Səhifə
            </a>
            <a href="#" className="text-sm text-gray-700 hover:text-pink-500 transition-colors">
              Hamilik
            </a>
            <a href="#" className="text-sm text-gray-700 hover:text-pink-500 transition-colors">
              Bloq
            </a>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors">
              <Search size={18} className="text-gray-600" />
            </button>
            
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <button className="px-2 py-1 hover:text-pink-500 transition-colors">AZ</button>
              <span className="text-gray-300">|</span>
              <button className="px-2 py-1 hover:text-pink-500 transition-colors">EN</button>
            </div>
            
            <button className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-full hover:border-pink-300 hover:text-pink-500 transition-colors">
              Giriş
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
