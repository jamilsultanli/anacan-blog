import { Search } from 'lucide-react';

export function Navigation() {
  return (
    <nav className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-2xl tracking-tight" style={{ color: '#7F56D9' }}>
              Anacan.az
            </span>
          </div>

          {/* Center Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-[#7F56D9] transition-colors">
              Hamiləlik
            </a>
            <a href="#" className="text-gray-700 hover:text-[#7F56D9] transition-colors">
              Körpə
            </a>
            <a href="#" className="text-gray-700 hover:text-[#7F56D9] transition-colors">
              Tərbiyə
            </a>
            <a href="#" className="text-gray-700 hover:text-[#7F56D9] transition-colors">
              Sağlamlıq
            </a>
            <a href="#" className="text-gray-700 hover:text-[#7F56D9] transition-colors">
              Özünə Qulluq
            </a>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-6">
            <button 
              className="text-gray-600 hover:text-[#7F56D9] transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            
            <button className="text-gray-700 hover:text-[#7F56D9] transition-colors">
              AZ
            </button>
            
            <button 
              className="px-6 py-2.5 rounded-2xl border border-gray-200 text-gray-700 hover:border-[#7F56D9] hover:text-[#7F56D9] transition-all"
            >
              Giriş
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
