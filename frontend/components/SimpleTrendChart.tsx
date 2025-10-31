'use client';

import { Language } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendData {
  month: number;
  person_days: number;
  households_provided: number;
  avg_wage_rate: number;
}

interface SimpleTrendChartProps {
  data: TrendData[];
  language: Language;
}

export default function SimpleTrendChart({ data, language }: SimpleTrendChartProps) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesHi = ['जन', 'फर', 'मार्च', 'अप्र', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्ट', 'नव', 'दिस'];

  // Get last 6 months of data
  const last6Months = data.slice(-6);

  // Format data for chart
  const chartData = last6Months.map((item) => ({
    month: language === 'en' ? monthNames[item.month - 1] : monthNamesHi[item.month - 1],
    households: item.households_provided,
    monthNum: item.month,
  }));

  // Calculate performance indicators (🟢🟡🔴)
  const performanceIndicators = last6Months.map((item, index) => {
    if (index === 0) return '🟡'; // First month has no comparison
    
    const prevMonth = last6Months[index - 1];
    const change = ((item.households_provided - prevMonth.households_provided) / prevMonth.households_provided) * 100;
    
    if (change >= 5) return '🟢'; // Growing
    if (change <= -5) return '🔴'; // Declining
    return '🟡'; // Stable
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {language === 'en' ? '📈 Work Trend (Last 6 Months)' : '📈 काम का रुझान (पिछले 6 महीने)'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {language === 'en' 
            ? 'Number of families who got work each month' 
            : 'प्रत्येक महीने काम पाने वाले परिवारों की संख्या'}
        </p>
      </div>

      {/* Line Chart */}
      <div className="mb-6" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '10px',
              }}
              formatter={(value: number) => [value.toLocaleString(), language === 'en' ? 'Families' : 'परिवार']}
            />
            <Line 
              type="monotone" 
              dataKey="households" 
              stroke="#f97316" 
              strokeWidth={3}
              dot={{ fill: '#f97316', r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Points */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {last6Months.map((item, index) => (
          <div 
            key={item.month}
            className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {language === 'en' ? monthNames[item.month - 1] : monthNamesHi[item.month - 1]}
            </div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {item.households_provided.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Trend Indicators */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
          {language === 'en' ? 'Performance Trend:' : 'प्रदर्शन प्रवृत्ति:'}
        </h4>
        <div className="flex items-center gap-2 flex-wrap">
          {performanceIndicators.map((indicator, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="text-2xl">{indicator}</span>
              {index < performanceIndicators.length - 1 && (
                <span className="text-gray-300 dark:text-gray-600">→</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
          <span className="inline-flex items-center gap-1 mr-4">
            <span>🟢</span> {language === 'en' ? 'Growing (+5%)' : 'बढ़ रहा है (+5%)'}
          </span>
          <span className="inline-flex items-center gap-1 mr-4">
            <span>🟡</span> {language === 'en' ? 'Stable' : 'स्थिर'}
          </span>
          <span className="inline-flex items-center gap-1">
            <span>🔴</span> {language === 'en' ? 'Declining (-5%)' : 'घट रहा है (-5%)'}
          </span>
        </div>
      </div>
    </div>
  );
}
