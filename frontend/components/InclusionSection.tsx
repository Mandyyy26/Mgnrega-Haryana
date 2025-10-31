import { Language } from '@/types';

interface InclusionSectionProps {
  data: {
    person_days: number;
    women_persondays: number;
    sc_persondays?: number;
    st_persondays?: number;
  };
  language: Language;
}

export default function InclusionSection({ data, language }: InclusionSectionProps) {
  // Calculate percentages
  const womenPercentage = data.person_days > 0 
    ? Math.round((data.women_persondays / data.person_days) * 100)
    : 0;

  const scPercentage = data.sc_persondays && data.person_days > 0
    ? Math.round((data.sc_persondays / data.person_days) * 100)
    : 0;

  const stPercentage = data.st_persondays && data.person_days > 0
    ? Math.round((data.st_persondays / data.person_days) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {language === 'en' ? '🤝 Inclusion & Diversity' : '🤝 समावेश और विविधता'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {language === 'en' 
            ? 'Who is benefiting from MGNREGA?' 
            : 'मनरेगा से किसे लाभ मिल रहा है?'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Women Workers */}
        <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl border-2 border-pink-200 dark:border-pink-800">
          <div className="text-5xl">👩</div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-1">
              {womenPercentage}%
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {language === 'en' ? 'Women Workers' : 'महिला कार्यकर्ता'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {data.women_persondays.toLocaleString()} {language === 'en' ? 'person-days' : 'व्यक्ति-दिवस'}
            </div>
          </div>
        </div>

        {/* SC Workers (if data available) */}
        {data.sc_persondays && data.sc_persondays > 0 && (
          <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <div className="text-5xl">👥</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {scPercentage}%
              </div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {language === 'en' ? 'SC Workers' : 'अनुसूचित जाति कार्यकर्ता'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {data.sc_persondays.toLocaleString()} {language === 'en' ? 'person-days' : 'व्यक्ति-दिवस'}
              </div>
            </div>
          </div>
        )}

        {/* ST Workers (if data available) */}
        {data.st_persondays && data.st_persondays > 0 && (
          <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
            <div className="text-5xl">🌳</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {stPercentage}%
              </div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {language === 'en' ? 'ST Workers' : 'अनुसूचित जनजाति कार्यकर्ता'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {data.st_persondays.toLocaleString()} {language === 'en' ? 'person-days' : 'व्यक्ति-दिवस'}
              </div>
            </div>
          </div>
        )}

        {/* Total Workers Card */}
        <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
          <div className="text-5xl">👷</div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {data.person_days.toLocaleString()}
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {language === 'en' ? 'Total Person-Days' : 'कुल व्यक्ति-दिवस'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {language === 'en' ? 'All workers this month' : 'इस महीने सभी कार्यकर्ता'}
            </div>
          </div>
        </div>
      </div>

      {/* Inclusion Insights */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
          {language === 'en' ? '💡 Inclusion Insights' : '💡 समावेश अंतर्दृष्टि'}
        </h4>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          {womenPercentage >= 50 ? (
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>
                {language === 'en'
                  ? `Strong women participation at ${womenPercentage}% - above national average!`
                  : `${womenPercentage}% पर मजबूत महिला भागीदारी - राष्ट्रीय औसत से ऊपर!`}
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <span className="text-yellow-500">!</span>
              <span>
                {language === 'en'
                  ? `Women participation at ${womenPercentage}% - potential to improve`
                  : `${womenPercentage}% पर महिला भागीदारी - सुधार की संभावना`}
              </span>
            </div>
          )}
          
          {(data.sc_persondays || data.st_persondays) && (
            <div className="flex items-start gap-2">
              <span className="text-blue-500">ℹ</span>
              <span>
                {language === 'en'
                  ? 'MGNREGA ensures inclusive participation from all communities'
                  : 'मनरेगा सभी समुदायों से समावेशी भागीदारी सुनिश्चित करता है'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
