import { Search, Instagram, User, Heart } from 'lucide-react@0.487.0';

export function BlogNavigation() {
  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#B8A4D9] to-[#7F56D9] rounded-full flex items-center justify-center">
              <Heart className="text-white" size={20} fill="white" />
            </div>
            <span className="text-xl tracking-tight text-gray-900">
              Anacan.az
            </span>
          </div>

          {/* Center Menu */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#" className="text-gray-700 hover:text-[#7F56D9] transition-colors text-sm">
              Ana Səhifə
            </a>
            <a href="#" className="text-gray-700 hover:text-[#7F56D9] transition-colors text-sm">
              Hamiləlik
            </a>
            <a href="#" className="text-gray-700 hover:text-[#7F56D9] transition-colors text-sm">
              Körpə Baxımı
            </a>
            <a href="#" className="text-gray-700 hover:text-[#7F56D9] transition-colors text-sm">
              Tərbiyə
            </a>
            <a href="#" className="text-gray-700 hover:text-[#7F56D9] transition-colors text-sm">
              Sağlamlıq
            </a>
            <a href="#" className="text-gray-700 hover:text-[#7F56D9] transition-colors text-sm">
              Özünə Qulluq
            </a>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Axtar..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-transparent w-48"
              />
            </div>
            
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <Instagram size={20} className="text-gray-600" />
            </button>
            
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <button className="hover:text-[#7F56D9] transition-colors">AZ</button>
              <span>|</span>
              <button className="hover:text-[#7F56D9] transition-colors">ENG</button>
            </div>
            
            <button className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center hover:bg-[#7F56D9] transition-colors">
              <User size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}