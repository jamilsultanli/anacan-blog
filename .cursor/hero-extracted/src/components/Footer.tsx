import { Instagram, Facebook, Youtube } from 'lucide-react@0.487.0';

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg text-gray-900 mb-4">
              Anacan<span className="text-pink-500">.az</span>
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Azərbaycanda analıq və uşaq baxımı mövzusunda ən etibarlı platformadır
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-pink-100 transition-colors">
                <Instagram size={18} className="text-gray-600 hover:text-pink-500" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-pink-100 transition-colors">
                <Facebook size={18} className="text-gray-600 hover:text-pink-500" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-pink-100 transition-colors">
                <Youtube size={18} className="text-gray-600 hover:text-pink-500" />
              </a>
            </div>
          </div>
          
          {/* Menu */}
          <div>
            <h4 className="text-sm text-gray-900 mb-4">Menyü</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-pink-500 transition-colors">Ana Səhifə</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-pink-500 transition-colors">Haqqımızda</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-pink-500 transition-colors">Bloq</a></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="text-sm text-gray-900 mb-4">Resurslar</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-pink-500 transition-colors">Hamiləlik</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-pink-500 transition-colors">Körpə</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-pink-500 transition-colors">Tərbiyə</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-sm text-gray-900 mb-4">Sosial şəbəkələr</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-pink-500 transition-colors">Instagram</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-pink-500 transition-colors">Facebook</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-pink-500 transition-colors">Youtube</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">© 2025 Anacan.az. Bütün hüquqlar qorunur</p>
        </div>
      </div>
    </footer>
  );
}
