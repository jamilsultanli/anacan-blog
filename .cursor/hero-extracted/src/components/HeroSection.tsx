import { ImageWithFallback } from './figma/ImageWithFallback';

export function HeroSection() {
  return (
    <section className="w-full bg-gradient-to-br from-white via-[#F9F5FF] to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 
                className="text-5xl lg:text-6xl tracking-tight leading-tight"
                style={{ 
                  color: '#1a1a1a',
                  fontWeight: 600,
                  lineHeight: '1.1'
                }}
              >
                Analıq yolunda ən yaxın bələdçiniz
              </h1>
              
              <p 
                className="text-xl lg:text-2xl text-gray-600 leading-relaxed"
                style={{ 
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Hamiləlikdən tərbiyəyə qədər hər addımda yanınızdayıq.
              </p>
            </div>

            <div className="pt-4">
              <button 
                className="px-8 py-4 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                style={{ 
                  backgroundColor: '#7F56D9',
                  fontSize: '1.125rem',
                  fontWeight: 500
                }}
              >
                Oxumağa başla
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 flex items-center gap-8">
              <div className="space-y-1">
                <div className="text-3xl" style={{ color: '#7F56D9', fontWeight: 600 }}>
                  50K+
                </div>
                <div className="text-sm text-gray-600">
                  Oxucu
                </div>
              </div>
              
              <div className="h-12 w-px bg-gray-200"></div>
              
              <div className="space-y-1">
                <div className="text-3xl" style={{ color: '#7F56D9', fontWeight: 600 }}>
                  500+
                </div>
                <div className="text-sm text-gray-600">
                  Məqalə
                </div>
              </div>
              
              <div className="h-12 w-px bg-gray-200"></div>
              
              <div className="space-y-1">
                <div className="text-3xl" style={{ color: '#7F56D9', fontWeight: 600 }}>
                  100%
                </div>
                <div className="text-sm text-gray-600">
                  Pulsuz
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="relative">
            <div 
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              style={{
                boxShadow: '0 25px 50px -12px rgba(127, 86, 217, 0.25)'
              }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1558636411-95b6f3dbfa6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RoZXIlMjBiYWJ5JTIwaGFwcHklMjBzb2Z0JTIwbGlnaHRpbmd8ZW58MXx8fHwxNzY3NTQ4NjM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Happy mother and baby"
                className="w-full h-auto aspect-[4/5] object-cover"
              />
            </div>
            
            {/* Decorative Elements */}
            <div 
              className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl opacity-60"
              style={{ backgroundColor: '#F9F5FF' }}
            ></div>
            <div 
              className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full blur-3xl opacity-60"
              style={{ backgroundColor: '#7F56D9' }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
}
