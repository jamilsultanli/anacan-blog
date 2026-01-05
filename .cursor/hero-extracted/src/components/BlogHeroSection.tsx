import { Heart, Baby, Users, ArrowRight, Sparkles, Book, Calendar, Apple, MessageCircle, Star } from 'lucide-react@0.487.0';
import { ImageWithFallback } from './figma/ImageWithFallback';
import heroImage from 'figma:asset/190b39e94cb765b1be974d71e3cc4c2cc8886a36.png';

export function BlogHeroSection() {
  return (
    <div className="w-full bg-gradient-to-b from-white to-[#F9F5FF]/30">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Main Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-10">
          {/* Left Content Area */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#E8DEFF] via-[#D4C5E8] to-[#C9B3E0] rounded-2xl p-8 flex flex-col justify-between shadow-lg">
            <div className="space-y-5">
              <h1 className="text-3xl lg:text-4xl leading-tight text-gray-900">
                Hər gün ən maraqlı{' '}
                <span className="text-pink-500">ana və körpə</span>{' '}
                mövzularını müzakirə edirik
              </h1>
              
              <p className="text-base text-gray-700 leading-relaxed">
                Hamiləlikdən körpə baxımına, tərbiyədən sağlamlığa qədər - peşəkar məsləhətlər və faydalı məlumatlar
              </p>
              
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-white/40 backdrop-blur-sm rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
                  <Heart size={18} className="text-[#7F56D9]" />
                </div>
                <div className="w-10 h-10 bg-white/40 backdrop-blur-sm rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
                  <Baby size={18} className="text-[#7F56D9]" />
                </div>
                <div className="w-10 h-10 bg-white/40 backdrop-blur-sm rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
                  <Users size={18} className="text-[#7F56D9]" />
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-6 pt-2">
                <div>
                  <div className="text-xl text-gray-900">5+</div>
                  <div className="text-xs text-gray-600">İl təcrübə</div>
                </div>
                <div className="h-10 w-px bg-white/30"></div>
                <div>
                  <div className="text-xl text-gray-900">5+</div>
                  <div className="text-xs text-gray-600">Mütəxəssis</div>
                </div>
                <div className="h-10 w-px bg-white/30"></div>
                <div>
                  <div className="text-xl text-gray-900">24/7</div>
                  <div className="text-xs text-gray-600">Dəstək</div>
                </div>
              </div>
            </div>

            <button className="mt-6 bg-white text-gray-900 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105 w-fit group">
              <span>Məqalələrə bax</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Center Mascot Image */}
          <div className="lg:col-span-4 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-pink-200 shadow-lg relative group p-8">
            <ImageWithFallback 
              src={heroImage}
              alt="Anacan.az Mascot"
              className="w-full h-auto"
            />
            <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-pink-400 rounded-full flex items-center justify-center shadow-lg">
              <Heart size={24} className="text-white" fill="white" />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            {/* About Card */}
            <div className="bg-gradient-to-br from-[#E8DEFF] to-[#D4C5E8] rounded-2xl p-5 shadow-lg">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-white ring-4 ring-white/50">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1741573379385-6458156e5f3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RoZXIlMjBiYWJ5JTIwdGVuZGVyJTIwbW9tZW50fGVufDF8fHx8MTc2NzU0OTU4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Anacan.az"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h3 className="text-base text-gray-900 mb-2 text-center">Bizimlə Tanış Olun</h3>
              <p className="text-xs text-gray-700 leading-relaxed text-center">
                Azərbaycanda analıq və uşaq baxımı mövzusunda ən böyük online platformadır.
              </p>
            </div>

            {/* Topics Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg">
              <h3 className="text-base text-gray-900 mb-3">Populyar Mövzular</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F9F5FF] transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#E8DEFF] to-[#D4C5E8] rounded-lg flex items-center justify-center">
                    <Heart size={14} className="text-[#7F56D9]" />
                  </div>
                  <span className="text-xs text-gray-700">Hamiləlik</span>
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F9F5FF] transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#E8DEFF] to-[#D4C5E8] rounded-lg flex items-center justify-center">
                    <Baby size={14} className="text-[#7F56D9]" />
                  </div>
                  <span className="text-xs text-gray-700">Körpə Baxımı</span>
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F9F5FF] transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#E8DEFF] to-[#D4C5E8] rounded-lg flex items-center justify-center">
                    <Book size={14} className="text-[#7F56D9]" />
                  </div>
                  <span className="text-xs text-gray-700">Uşaq Tərbiyəsi</span>
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F9F5FF] transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#E8DEFF] to-[#D4C5E8] rounded-lg flex items-center justify-center">
                    <Sparkles size={14} className="text-[#7F56D9]" />
                  </div>
                  <span className="text-xs text-gray-700">Özünə Qulluq</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Most Read Categories Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl text-gray-900">ƏN ÇOX OXUNAN KATEQORİYALAR</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center gap-3 cursor-pointer group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 ring-4 ring-transparent group-hover:ring-[#7F56D9]/30 transition-all shadow-md">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1706087959729-229f304e92c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwcHJlZ25hbnQlMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2NzU0OTU4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Hamiləlik"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <span className="text-sm text-gray-700 text-center">Hamiləlik</span>
              <span className="text-xs text-gray-500">248 məqalə</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 cursor-pointer group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 ring-4 ring-transparent group-hover:ring-[#7F56D9]/30 transition-all shadow-md">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1756367141155-487da3717d54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXdib3JuJTIwYmFieSUyMGdlbnRsZXxlbnwxfHx8fDE3Njc1NDk1ODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Körpə Baxımı"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <span className="text-sm text-gray-700 text-center">Körpə Baxımı</span>
              <span className="text-xs text-gray-500">182 məqalə</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 cursor-pointer group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 ring-4 ring-transparent group-hover:ring-[#7F56D9]/30 transition-all shadow-md">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1763013259158-8a8370542ddb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJlbnRpbmclMjBlZHVjYXRpb24lMjBjaGlsZHJlbnxlbnwxfHx8fDE3Njc1NDk1ODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Uşaq Tərbiyəsi"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <span className="text-sm text-gray-700 text-center">Uşaq Tərbiyəsi</span>
              <span className="text-xs text-gray-500">156 məqalə</span>
            </div>

            <div className="flex flex-col items-center gap-3 cursor-pointer group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 ring-4 ring-transparent group-hover:ring-[#7F56D9]/30 transition-all shadow-md">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1575883107884-4735c43fc29c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHdlbGxuZXNzJTIwc2VsZiUyMGNhcmV8ZW58MXx8fHwxNzY3NTQ5NTg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Özünə Qulluq"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <span className="text-sm text-gray-700 text-center">Özünə Qulluq</span>
              <span className="text-xs text-gray-500">124 məqalə</span>
            </div>
          </div>
        </div>

        {/* Most Read Blog Posts Section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl text-gray-900">ƏN ÇOX OXUNAN MƏQALƏLƏR</h2>
            <button className="text-sm text-[#7F56D9] hover:text-[#6941C6] transition-colors flex items-center gap-2">
              Hamısına bax
              <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all cursor-pointer hover:border-[#7F56D9]/30 group">
              <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-200 mb-3">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1734607404585-bd97529f1f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwcHJlZ25hbmN5JTIwbnutritiounxlufDF8fHx8MTc2NzU0OTA2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Hamiləlik Qidalanması"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-[#7F56D9] bg-[#F9F5FF] px-2 py-1 rounded-full">Hamiləlik</span>
              </div>
              <h4 className="text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-[#7F56D9] transition-colors">
                Hamiləliyin İlk Trimestrində Qidalanma: Nələrə Diqqət Etməli?
              </h4>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  3 gün əvvəl
                </span>
                <span>•</span>
                <span>8 dəqiqə</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all cursor-pointer hover:border-[#7F56D9]/30 group">
              <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-200 mb-3">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1756367141155-487da3717d54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXdib3JuJTIwYmFieSUyMGdlbnRsZXxlbnwxfHx8fDE3Njc1NDk1ODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Yeni Doğulmuş Körpə"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-[#7F56D9] bg-[#F9F5FF] px-2 py-1 rounded-full">Körpə Baxımı</span>
              </div>
              <h4 className="text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-[#7F56D9] transition-colors">
                Yeni Doğulmuş Körpənin İlk 30 Günü: Gözləntilər və Məsləhətlər
              </h4>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  5 gün əvvəl
                </span>
                <span>•</span>
                <span>12 dəqiqə</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all cursor-pointer hover:border-[#7F56D9]/30 group">
              <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-200 mb-3">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1741573379385-6458156e5f3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RoZXIlMjBiYWJ5JTIwdGVuZGVyJTIwbW9tZW50fGVufDF8fHx8MTc2NzU0OTU4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Ana və Körpə"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Star size={12} className="text-[#7F56D9]" fill="#7F56D9" />
                <span className="text-xs text-gray-500">Populyar</span>
              </div>
              <h4 className="text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-[#7F56D9] transition-colors">
                Ana Süd Verməyə Hazırlıq: 10 Vacib Məsləhət
              </h4>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  1 həftə əvvəl
                </span>
                <span>•</span>
                <span>6 dəqiqə</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}