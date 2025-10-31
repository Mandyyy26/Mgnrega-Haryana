import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface DistrictCardProps {
  code: string;
  name: string;
  nameHi: string;
  language: 'en' | 'hi';
}

export default function DistrictCard({ code, name, nameHi, language }: DistrictCardProps) {
  return (
    <Link href={`/district/${code}`}>
      <div className="card hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {language === 'en' ? name : nameHi}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'hi' ? name : nameHi}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
        </div>
      </div>
    </Link>
  );
}
