'use client';

import { Language } from '@/types';
import { Trophy, Info, TrendingUp, Users, CheckCircle2, Heart, Coins } from 'lucide-react';
import Link from 'next/link';
import Tooltip from './Tooltip';

interface TopPerformer {
  district_code: string;
  name: string;
  name_hi: string;
  person_days: number;
  households_provided: number;
  performance_score?: number;
  completion_rate?: number;
  women_participation_rate?: number;
  avg_wage_rate?: number;
  works_completed?: number;
  works_ongoing?: number;
}

interface TopPerformersProps {
  performers: TopPerformer[];
  language: Language;
}

const getRankEmoji = (index: number) => {
  switch (index) {
    case 0: return '🥇';
    case 1: return '🥈';
    case 2: return '🥉';
    case 3: return '🏅';
    case 4: return '🏅';
    default: return '🏅';
  }
};

const getRankColor = (index: number) => {
  switch (index) {
    case 0: return 'from-yellow-400 to-yellow-600';
    case 1: return 'from-gray-300 to-gray-500';
    case 2: return 'from-orange-400 to-orange-600';
    default: return 'from-blue-400 to-blue-600';
  }
};

export default function TopPerformers({ performers, language }: TopPerformersProps) {
  const scoringMethodology = language === 'en' 
    ? `Ranking based on composite performance score (out of 10):
• Employment Generation: 30%
• Households Reached: 25%
• Project Completion: 20%
• Women Participation: 15%
• Wage Adequacy: 10%`
    : `समग्र प्रदर्शन स्कोर के आधार पर रैंकिंग (10 में से):
• रोजगार सृजन: 30%
• परिवार पहुंच: 25%
• परियोजना पूर्णता: 20%
• महिला भागीदारी: 15%
• मजदूरी पर्याप्तता: 10%`;

  // Calculate completion rate if not provided
  const calculateCompletionRate = (performer: TopPerformer) => {
    if (performer.completion_rate !== undefined) {
      return performer.completion_rate;
    }
    if (performer.works_completed && performer.works_ongoing) {
      const total = performer.works_completed + performer.works_ongoing;
      return total > 0 ? (performer.works_completed / total) * 100 : 0;
    }
    return 0;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-7 h-7 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'en' ? 'Top 5 Performing Districts' : 'शीर्ष 5 प्रदर्शन करने वाले जिले'}
          </h2>
        </div>
        <Tooltip content={scoringMethodology} position="left">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-help">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performers.map((performer, index) => {
          const completionRate = calculateCompletionRate(performer);
          const performanceScore = performer.performance_score || 0;
          const womenRate = performer.women_participation_rate || 0;
          const avgWage = performer.avg_wage_rate || 0;

          return (
            <Link
              key={performer.district_code}
              href={`/district/${performer.district_code}`}
              className="group"
            >
              <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 dark:border-gray-700 hover:border-orange-300 dark:hover:border-green-600 overflow-hidden">
                {/* Rank Badge */}
                <div className={`absolute top-0 left-0 w-24 h-24 -translate-x-8 -translate-y-8 bg-gradient-to-br ${getRankColor(index)} opacity-10 rounded-full`}></div>
                
                <div className="relative">
                  {/* Rank and Score */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-4xl">{getRankEmoji(index)}</span>
                      <span className="text-3xl font-bold text-orange-500 dark:text-orange-400">
                        #{index + 1}
                      </span>
                    </div>
                    {performanceScore > 0 && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {performanceScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {language === 'en' ? 'score' : 'स्कोर'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* District Name */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-orange-600 dark:group-hover:text-green-500 transition-colors">
                    {language === 'en' ? performer.name : performer.name_hi}
                  </h3>

                  {/* Key Metrics */}
                  <div className="space-y-3">
                    {/* Employment */}
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {performer.person_days.toLocaleString('en-IN')}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {language === 'en' ? 'person-days' : 'व्यक्ति-दिवस'}
                      </span>
                    </div>

                    {/* Households */}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {performer.households_provided.toLocaleString('en-IN')}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {language === 'en' ? 'households' : 'परिवार'}
                      </span>
                    </div>

                    {/* Completion Rate */}
                    {completionRate > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {completionRate.toFixed(1)}%
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {language === 'en' ? 'completed' : 'पूर्ण'}
                        </span>
                      </div>
                    )}

                    {/* Women Participation */}
                    {womenRate > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {womenRate.toFixed(1)}%
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {language === 'en' ? 'women' : 'महिला'}
                        </span>
                      </div>
                    )}

                    {/* Average Wage */}
                    {avgWage > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          ₹{avgWage}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {language === 'en' ? '/day' : '/दिन'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* View Details Arrow */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm text-orange-600 dark:text-green-500 group-hover:translate-x-1 transition-transform">
                      <span>{language === 'en' ? 'View Details' : 'विवरण देखें'}</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
