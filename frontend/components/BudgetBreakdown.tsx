'use client';

import { Language } from '@/types';
import { Wallet, Info, Coins, Hammer, Briefcase, Users } from 'lucide-react';
import Tooltip from './Tooltip';

interface BudgetBreakdownProps {
  data: {
    total_exp: number | string;  // Accept both
    wages: number | string;      // Accept both
    material_and_skilled_wages: number | string;  // Accept both
    total_adm_expenditure: number | string;       // Accept both
    total_households_worked?: number;
  };
  language: Language;
}

export default function BudgetBreakdown({ data, language }: BudgetBreakdownProps) {
  // Convert all values to numbers (in case they come as strings)
  const totalExp = parseFloat(String(data.total_exp)) || 0;
  const wagesVal = parseFloat(String(data.wages)) || 0;
  const materialsVal = parseFloat(String(data.material_and_skilled_wages)) || 0;
  const adminVal = parseFloat(String(data.total_adm_expenditure)) || 0;

  // All values are in lakhs, convert to actual rupees for calculations
  const totalSpending = totalExp * 100000;
  const wageSpending = wagesVal * 100000;
  const materialSpending = materialsVal * 100000;
  const adminSpending = adminVal * 100000;

  // Calculate percentages
  const wagePercentage = totalSpending > 0 ? (wageSpending / totalSpending) * 100 : 0;
  const materialPercentage = totalSpending > 0 ? (materialSpending / totalSpending) * 100 : 0;
  const adminPercentage = totalSpending > 0 ? (adminSpending / totalSpending) * 100 : 0;

  const categories = [
    {
      icon: <Coins className="w-6 h-6" />,
      title: 'Wages',
      titleHi: 'मजदूरी',
      amount: wageSpending,
      percentage: wagePercentage,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'Direct payments to workers for employment',
      descriptionHi: 'रोजगार के लिए श्रमिकों को सीधा भुगतान',
    },
    {
      icon: <Hammer className="w-6 h-6" />,
      title: 'Materials',
      titleHi: 'सामग्री',
      amount: materialSpending,
      percentage: materialPercentage,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'Raw materials and equipment for projects',
      descriptionHi: 'परियोजनाओं के लिए कच्चा माल और उपकरण',
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Administration',
      titleHi: 'प्रशासन',
      amount: adminSpending,
      percentage: adminPercentage,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'Administrative and operational costs',
      descriptionHi: 'प्रशासनिक और परिचालन लागत',
    },
  ];

  const tooltipContent = language === 'en'
    ? `Budget allocation breakdown:
• Wages: ₹${wagesVal.toFixed(2)} Lakh (${wagePercentage.toFixed(1)}%)
• Materials: ₹${materialsVal.toFixed(2)} Lakh (${materialPercentage.toFixed(1)}%)
• Administration: ₹${adminVal.toFixed(2)} Lakh (${adminPercentage.toFixed(1)}%)
Total: ₹${totalExp.toFixed(2)} Lakh

Note: Actual expenditure data from MGNREGA records`
    : `बजट आवंटन विवरण:
• मजदूरी: ₹${wagesVal.toFixed(2)} लाख (${wagePercentage.toFixed(1)}%)
• सामग्री: ₹${materialsVal.toFixed(2)} लाख (${materialPercentage.toFixed(1)}%)
• प्रशासन: ₹${adminVal.toFixed(2)} लाख (${adminPercentage.toFixed(1)}%)
कुल: ₹${totalExp.toFixed(2)} लाख

नोट: मनरेगा रिकॉर्ड से वास्तविक व्यय डेटा`;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Wallet className="w-7 h-7 text-green-600 dark:text-green-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'en' ? 'Where Does the Money Go?' : 'पैसा कहाँ जाता है?'}
          </h2>
        </div>
        <Tooltip content={tooltipContent} position="left">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-help">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </Tooltip>
      </div>

      {/* Total Budget Card */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 mb-6 border-2 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 dark:text-green-400 mb-1">
              {language === 'en' ? 'Total Spending' : 'कुल खर्च'}
            </p>
            <p className="text-4xl font-bold text-green-900 dark:text-green-300">
              ₹{totalExp.toFixed(2)} L
            </p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
              {language === 'en' ? 'This Month' : 'इस महीने'}
              {data.total_households_worked && ` • ${data.total_households_worked.toLocaleString()} ${language === 'en' ? 'households' : 'परिवार'}`}
            </p>
          </div>
          <div className="w-16 h-16 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-green-700 dark:text-green-300" />
          </div>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
          >
            <div className={`w-14 h-14 ${category.bgColor} rounded-xl flex items-center justify-center mb-4 ${category.color}`}>
              {category.icon}
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {language === 'en' ? category.title : category.titleHi}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 min-h-[40px]">
              {language === 'en' ? category.description : category.descriptionHi}
            </p>

            {/* Amount */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{Math.round(category.percentage)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'en' ? 'of every ₹100' : 'हर ₹100 में से'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ₹{(category.amount / 100000).toFixed(2)} L {language === 'en' ? 'total' : 'कुल'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${category.color.replace('text-', 'bg-')} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.min(category.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className={`text-sm font-bold ${category.color}`}>
                  {category.percentage.toFixed(1)}%
                </span>
                {category.percentage >= 60 && category.title === 'Wages' && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ {language === 'en' ? 'Compliant' : 'अनुपालन'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MGNREGA Compliance Note */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-900 dark:text-blue-300 font-medium mb-1">
              {language === 'en' ? 'MGNREGA Guidelines' : 'मनरेगा दिशानिर्देश'}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              {language === 'en'
                ? `MGNREGA mandates a minimum wage-to-material ratio of 60:40 to ensure worker welfare. This district is spending ${wagePercentage.toFixed(1)}% on wages${wagePercentage >= 60 ? ' ✓' : ' (below requirement)'}.`
                : `मनरेगा श्रमिक कल्याण सुनिश्चित करने के लिए न्यूनतम 60:40 के मजदूरी-सामग्री अनुपात को अनिवार्य बनाता है। यह जिला मजदूरी पर ${wagePercentage.toFixed(1)}% खर्च कर रहा है${wagePercentage >= 60 ? ' ✓' : ' (आवश्यकता से कम)'}.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
