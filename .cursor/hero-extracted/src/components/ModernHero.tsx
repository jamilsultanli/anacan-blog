import { ArrowRight, Heart } from 'lucide-react@0.487.0';
import { ImageWithFallback } from './figma/ImageWithFallback';
import heroImage from 'figma:asset/190b39e94cb765b1be974d71e3cc4c2cc8886a36.png';

export function ModernHero() {
  return (
    <div className="w-full bg-gradient-to-b from-pink-50/50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full text-xs text-pink-600">
              <Heart size={14} fill="#EC4899" className="text-pink-500" />
              Analıq və ana məsləhətləri
            </div>
            
            <h1 className="text-5xl lg:text-6xl leading-tight">
              Hər gün ən maraqlı{' '}
              <span className="text-pink-500">ana və körpə</span>{' '}
              mövzularını müzakirə olunur
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Hamiləlikdən körpə baxımına, tərbiyədən sağlamlığa qədər - peşəkar məsləhətlər və faydalı məlumatlar
            </p>
            
            <div className="flex items-center gap-4 pt-4">
              <button className="px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all flex items-center gap-2 group">
                <span>Məqalələrə bax</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-2xl text-gray-900">5+</div>
                <div className="text-sm text-gray-500">İl təcrübə</div>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <div>
                <div className="text-2xl text-gray-900">5+</div>
                <div className="text-sm text-gray-500">Mütəxəssis</div>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <div>
                <div className="text-2xl text-gray-900">24/7</div>
                <div className="text-sm text-gray-500">Dəstək</div>
              </div>
            </div>
          </div>
          
          {/* Right Illustration */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl p-12 shadow-xl">
              <ImageWithFallback 
                src={heroImage}
                alt="Anacan.az Mascot"
                className="w-full h-auto"
              />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center shadow-lg">
                <Heart size={28} className="text-white" fill="white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
