import { t, Language } from '@/lib/translations';
import Image from 'next/image';

interface HeaderProps {
  language: Language;
}

export default function Header({ language }: HeaderProps) {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-green-500 rounded-2xl shadow-lg overflow-hidden mb-8">
      <div className="container mx-auto px-8 py-12">
        
        {/* Main content with flexbox */}
        <div className="flex items-center justify-between gap-8">
          
          {/* Left side: Text + Stats */}
          <div className="flex-1">
            <h1 className="text-5xl font-bold text-white mb-3">
              {t(language, 'title')}
            </h1>
            <p className="text-white text-lg mb-8">
              {t(language, 'subtitle')}
            </p>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/40">
                <div className="text-3xl font-bold text-white">22</div>
                <div className="text-sm font-medium text-white/90">
                  {t(language, 'districts')}
                </div>
              </div>
              
              <div className="bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/40">
                <div className="text-3xl font-bold text-white">418</div>
                <div className="text-sm font-medium text-white/90">
                  {t(language, 'records')}
                </div>
              </div>
              
              <div className="bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/40">
                <div className="text-3xl font-bold text-white">19</div>
                <div className="text-sm font-medium text-white/90">
                  {t(language, 'months')}
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Map - FIXED OPACITY */}
          <div className="hidden lg:block relative">
            <div className="relative w-80 h-60 opacity-90 hover:opacity-80 transition-opacity duration-300 mr-20">
              <Image
                src="/haryana_map.png"
                alt="Haryana Map"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
            <div className="absolute -bottom-2 left-0 right-0 text-center">
              <p className="text-white text-xs font-semibold opacity-60">
                {t(language, 'haryana')}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
