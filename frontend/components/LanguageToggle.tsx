'use client';

import { Languages } from 'lucide-react';

interface LanguageToggleProps {
  currentLang: 'en' | 'hi';
  onToggle: (lang: 'en' | 'hi') => void;
}

export default function LanguageToggle({ currentLang, onToggle }: LanguageToggleProps) {
  return (
    <button
      onClick={() => onToggle(currentLang === 'en' ? 'hi' : 'en')}
      className="p-3 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-green-500 transition-all shadow-lg hover:shadow-xl relative"
      aria-label="Toggle language"
    >
      <Languages className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-orange-500 text-white px-1 rounded-full">
        {currentLang.toUpperCase()}
      </span>
    </button>
  );
}
