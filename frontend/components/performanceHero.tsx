import { Language } from '@/types';
import Tooltip from './Tooltip';
import { getTooltip } from '@/lib/tooltips';


interface PerformanceHeroProps {
  districtName: string;
  month: number;
  year: string;
  score: number;
  label: string;
  color: string;
  emoji: string;
  breakdown: {
    payment: { label: string };
    work: { label: string };
    completion: { label: string };
    women: { label: string };
  };
  language: Language;
}

export default function PerformanceHero({
  districtName,
  month,
  year,
  score,
  label,
  color,
  emoji,
  breakdown,
  language,
}: PerformanceHeroProps) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesHi = ['जन', 'फर', 'मार्च', 'अप्र', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्ट', 'नव', 'दिस'];

  const monthName = language === 'en' ? monthNames[month - 1] : monthNamesHi[month - 1];

  return (
    <div className="bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 mb-8 border-2 border-orange-200 dark:border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {districtName}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {monthName} {year}
        </p>
      </div>

      {/* Performance Score */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>

          <div className="flex items-center gap-3">

            <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
              {language === 'en' ? 'Performance Score' : 'प्रदर्शन स्कोर'}
            </p>
            <Tooltip content={getTooltip('performanceScore', language)} />
          </div>
        

            <div className="flex items-center gap-3">
              <span className="text-5xl font-bold text-orange-600 dark:text-orange-400">
                {score}
              </span>
              <span className="text-3xl text-gray-400">/10</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-2xl font-bold mb-1">
              <span>{color}</span>
              <span className="text-gray-900 dark:text-white">{label}</span>
              <span>{emoji}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Glance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {language === 'en' ? '⚡ Quick Glance' : '⚡ त्वरित नज़र'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <span className={`text-2xl ${getStatusIcon(breakdown.payment.label)}`}>
              {getStatusEmoji(breakdown.payment.label)}
            </span>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'en' ? 'Wage Rate:' : 'मजदूरी दर:'}

              </span>
              <span className={`ml-2 font-bold ${getStatusColor(breakdown.payment.label)}`}>
                {breakdown.payment.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-2xl ${getStatusIcon(breakdown.work.label)}`}>
              {getStatusEmoji(breakdown.work.label)}
            </span>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'en' ? 'Work Availability:' : 'काम उपलब्धता:'}
              </span>
              <span className={`ml-2 font-bold ${getStatusColor(breakdown.work.label)}`}>
                {breakdown.work.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-2xl ${getStatusIcon(breakdown.completion.label)}`}>
              {getStatusEmoji(breakdown.completion.label)}
            </span>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'en' ? 'Projects Completed:' : 'परियोजनाएं पूरी:'}
              </span>
              <span className={`ml-2 font-bold ${getStatusColor(breakdown.completion.label)}`}>
                {breakdown.completion.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-2xl ${getStatusIcon(breakdown.women.label)}`}>
              {getStatusEmoji(breakdown.women.label)}
            </span>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'en' ? 'Women Participation:' : 'महिला भागीदारी:'}
              </span>
              <span className={`ml-2 font-bold ${getStatusColor(breakdown.women.label)}`}>
                {breakdown.women.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusEmoji(status: string): string {
  if (status === 'EXCELLENT' || status === 'HIGH') return '✅';
  if (status === 'GOOD' || status === 'MEDIUM') return '⚠️';
  return '❌';
}

function getStatusIcon(status: string): string {
  return '';
}

function getStatusColor(status: string): string {
  if (status === 'EXCELLENT' || status === 'HIGH') return 'text-green-600 dark:text-green-400';
  if (status === 'GOOD' || status === 'MEDIUM') return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}
