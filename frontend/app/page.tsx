'use client';

import { useState, useEffect } from 'react';
import { getDistricts, getRankings } from '@/lib/api';
import { District, Language } from '@/types';
import Header from '@/components/Header';
import DistrictCard from '@/components/DistrictCard';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import DistrictAutoDetect from '@/components/DistrictAutoDetect';
import TopPerformers from '@/components/TopPerformers';
import { t } from '@/lib/translations';
import { Search } from 'lucide-react';

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [districts, setDistricts] = useState<District[]>([]);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [districtsData, rankingsData] = await Promise.all([
          getDistricts(),
          getRankings(),
        ]);
        
        setDistricts(Array.isArray(districtsData) ? districtsData : districtsData.districts || []);
        setTopPerformers(Array.isArray(rankingsData) ? rankingsData : rankingsData.rankings || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setDistricts([]);
        setTopPerformers([]);
        setError('Backend API not available yet. Please check back later.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredDistricts = districts.filter((d) =>
    language === 'en'
      ? d.name.toLowerCase().includes(search.toLowerCase())
      : d.name_hi.includes(search)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      {/* Fixed Floating Controls */}
      <div className="fixed top-6 right-6 z-50 flex gap-3">
        <LanguageToggle currentLang={language} onToggle={setLanguage} />
        <ThemeToggle />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header language={language} />

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 rounded">
            <p className="text-amber-800 dark:text-amber-200">
              ℹ️ {error}
            </p>
          </div>
        )}

        {/* Top 5 Performers - Only if data exists */}
        {topPerformers.length > 0 && (
          <TopPerformers performers={topPerformers} language={language} />
        )}

        {/* Auto-Detect District */}
        <div className="mb-8">
          <DistrictAutoDetect language={language} />
        </div>

        {/* District Selector */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t(language, 'selectDistrict')}
          </h2>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search districts...' : 'जिले खोजें...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-green-500 outline-none transition-colors"
            />
          </div>

          {/* District Grid */}
          {districts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDistricts.map((district) => (
                <DistrictCard
                  key={district.district_code}
                  code={district.district_code}
                  name={district.name}
                  nameHi={district.name_hi}
                  language={language}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {language === 'en' 
                ? 'No districts available - backend API is being set up' 
                : 'कोई जिला उपलब्ध नहीं है'}
            </div>
          )}

          <div className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              {language === 'en' 
                ? '🇮🇳 Data from Open Government Data Platform (data.gov.in)'
                : '🇮🇳 ओपन गवर्नमेंट डेटा प्लेटफॉर्म से डेटा (data.gov.in)'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {language === 'en'
                ? 'Made with ❤️ for transparent governance'
                : 'पारदर्शी शासन के लिए ❤️ से बनाया गया'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
