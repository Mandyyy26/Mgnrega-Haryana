'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getDistrictData, getDistrictTrend, getDistricts } from '@/lib/api';
import { Language } from '@/types';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import PerformanceHero from '@/components/performanceHero';
import SimplifiedMetricCard from '@/components/SimplifiedMetricCard';
import SimpleTrendChart from '@/components/SimpleTrendChart';
import InclusionSection from '@/components/InclusionSection';
import BudgetBreakdown from '@/components/BudgetBreakdown';
import { calculatePerformanceScore } from '@/lib/scoring';
import { getTooltip } from '@/lib/tooltips';
import { ArrowLeft, Download, Calendar } from 'lucide-react';
import Link from 'next/link';

// Financial year months (April = month 4 to Oct = month 10)
const AVAILABLE_MONTHS = [
  // FY 2024-2025 (April 2024 to March 2025)
  { month: 4, year: 2024, fy: '2024-2025', label: 'Apr 2024', labelHi: 'अप्र 2024' },
  { month: 5, year: 2024, fy: '2024-2025', label: 'May 2024', labelHi: 'मई 2024' },
  { month: 6, year: 2024, fy: '2024-2025', label: 'Jun 2024', labelHi: 'जून 2024' },
  { month: 7, year: 2024, fy: '2024-2025', label: 'Jul 2024', labelHi: 'जुल 2024' },
  { month: 8, year: 2024, fy: '2024-2025', label: 'Aug 2024', labelHi: 'अग 2024' },
  { month: 9, year: 2024, fy: '2024-2025', label: 'Sep 2024', labelHi: 'सित 2024' },
  { month: 10, year: 2024, fy: '2024-2025', label: 'Oct 2024', labelHi: 'अक्ट 2024' },
  { month: 11, year: 2024, fy: '2024-2025', label: 'Nov 2024', labelHi: 'नव 2024' },
  { month: 12, year: 2024, fy: '2024-2025', label: 'Dec 2024', labelHi: 'दिस 2024' },
  { month: 1, year: 2025, fy: '2024-2025', label: 'Jan 2025', labelHi: 'जन 2025' },
  { month: 2, year: 2025, fy: '2024-2025', label: 'Feb 2025', labelHi: 'फर 2025' },
  { month: 3, year: 2025, fy: '2024-2025', label: 'Mar 2025', labelHi: 'मार्च 2025' },
  
  // FY 2025-2026 (April 2025 to October 2025)
  { month: 4, year: 2025, fy: '2025-2026', label: 'Apr 2025', labelHi: 'अप्र 2025' },
  { month: 5, year: 2025, fy: '2025-2026', label: 'May 2025', labelHi: 'मई 2025' },
  { month: 6, year: 2025, fy: '2025-2026', label: 'Jun 2025', labelHi: 'जून 2025' },
  { month: 7, year: 2025, fy: '2025-2026', label: 'Jul 2025', labelHi: 'जुल 2025' },
  { month: 8, year: 2025, fy: '2025-2026', label: 'Aug 2025', labelHi: 'अग 2025' },
  { month: 9, year: 2025, fy: '2025-2026', label: 'Sep 2025', labelHi: 'सित 2025' },
  { month: 10, year: 2025, fy: '2025-2026', label: 'Oct 2025', labelHi: 'अक्ट 2025' },
];

export default function DistrictPage() {
  const params = useParams();
  const [language, setLanguage] = useState<Language>('en');
  const [data, setData] = useState<any | null>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Default to most recent month (Oct 2025)
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(AVAILABLE_MONTHS.length - 1);
  const [districtInfo, setDistrictInfo] = useState<any>(null);

  const code = params.code as string;
  const selectedMonthData = AVAILABLE_MONTHS[selectedMonthIndex];

  const householdsWorked = parseInt(String(data?.current?.households_provided)) || 0;
const totalWages = parseFloat(String(data?.current?.total_wages_paid)) || 0;
const householdIncome = householdsWorked > 0 ? Math.round((totalWages * 100000) / householdsWorked) : 0;


  // Fetch district info
  useEffect(() => {
    async function fetchDistrictInfo() {
      try {
        const districts = await getDistricts();
        const district = Array.isArray(districts) 
          ? districts.find((d: any) => d.district_code === code)
          : districts.districts?.find((d: any) => d.district_code === code);
        
        setDistrictInfo(district);
      } catch (error) {
        console.error('Error fetching district info:', error);
      }
    }
    fetchDistrictInfo();
  }, [code]);

  // Fetch data for selected month
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [districtData, trendData] = await Promise.all([
          getDistrictData(code, selectedMonthData.month),
          getDistrictTrend(code),
        ]);
        
        setData(districtData);
        setTrend(Array.isArray(trendData) ? trendData : trendData.trend || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [code, selectedMonthData.month]);

  const exportCSV = () => {
    if (!data || !data.current) return;
    
    const districtName = districtInfo?.name || data.district?.name || 'Unknown';
    const csv = [
      ['Metric', 'Value'],
      ['District', districtName],
      ['Month', `${selectedMonthData.label}`],
      ['Financial Year', selectedMonthData.fy],
      ['Households Worked', data.current.households_provided || 0],
      ['Person Days', data.current.person_days || 0],
      ['Average Wage Rate', data.current.avg_wage_rate || 0],
      ['Works Completed', data.current.works_completed || 0],
      ['Works Ongoing', data.current.works_ongoing || 0],
      ['Women Persondays', data.current.women_persondays || 0],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${districtName}_${selectedMonthData.label}_MGNREGA_data.csv`;
    a.click();
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!data || !data.current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">District not found</h1>
          <Link href="/" className="text-orange-500 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const districtName = language === 'en' 
    ? (districtInfo?.name || data.district?.name || 'Loading...')
    : (districtInfo?.name_hi || data.district?.name_hi || districtInfo?.name || 'लोड हो रहा है...');

  const performanceScore = calculatePerformanceScore(data.current);

  return (
    <main className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="fixed top-6 right-6 z-50 flex gap-3">
        <LanguageToggle currentLang={language} onToggle={setLanguage} />
        <ThemeToggle />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 dark:text-green-500 dark:hover:text-green-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'en' ? 'Back to Districts' : 'जिलों पर वापस जाएं'}
          </Link>
        </div>

        {/* Month Selector & Export */}
        <div className="flex justify-end gap-3 mb-6">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={selectedMonthIndex}
              onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white cursor-pointer hover:border-orange-500 dark:hover:border-green-500 transition-colors"
            >
              {AVAILABLE_MONTHS.map((monthData, index) => (
                <option key={`${monthData.fy}-${monthData.month}`} value={index}>
                  {language === 'en' ? monthData.label : monthData.labelHi}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            {language === 'en' ? 'Export CSV' : 'CSV निर्यात करें'}
          </button>
        </div>

        {/* Performance Hero Section */}
        <PerformanceHero
          districtName={districtName}
          month={selectedMonthData.month}
          year={selectedMonthData.fy}
          score={performanceScore.overall}
          label={performanceScore.label}
          color={performanceScore.color}
          emoji={performanceScore.emoji}
          breakdown={performanceScore.breakdown}
          language={language}
        />

        {loading && (
          <div className="mb-4 text-center text-gray-500 dark:text-gray-400">
            {language === 'en' ? 'Loading data...' : 'डेटा लोड हो रहा है...'}
          </div>
        )}

                {/* Section B: Simplified Visual Metrics */}
<div className="mb-8">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
    {language === 'en' ? '📊 Key Metrics' : '📊 मुख्य मेट्रिक्स'}
  </h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Card 1: Work Provided */}
    <SimplifiedMetricCard
      icon="👨‍👩‍👧‍👦"
      title={language === 'en' ? 'Work Provided' : 'काम प्रदान किया'}
      bigNumber={data.current.households_provided || 0}
      description={
        language === 'en'
          ? 'Families got work this month'
          : 'इस महीने परिवारों को काम मिला'
      }
      tooltip={getTooltip('householdsWorked', language)}

      progressBar={{
        value: 47, // Calculate: (households_provided / total_job_cards) * 100
        label:
          language === 'en'
            ? '47% of job card holders got work'
            : '47% जॉब कार्ड धारकों को काम मिला',
      }}
      language={language}
    />

    {/* Card 2: Payment Status */}
    <SimplifiedMetricCard
  icon="👨‍👩‍👧‍👦"
  title={language === 'en' ? 'Income per Family' : 'प्रति परिवार आय'}
  bigNumber={`₹${householdIncome}`}
  description={
    language === 'en'
      ? 'Average earnings this month'
      : 'इस महीने औसत आय'
  }
  tooltip={getTooltip('householdIncome', language)}
  status={{
    badge: householdIncome > 5000
      ? (language === 'en' ? 'GOOD' : 'अच्छा')
      : (language === 'en' ? 'AVERAGE' : 'औसत'),
    color: householdIncome > 5000 ? 'excellent' : 'good',
    detail:
      language === 'en'
        ? `${householdsWorked} households worked`
        : `${householdsWorked} परिवारों ने काम किया`,
  }}
  language={language}
/>


    {/* Card 3: Project Progress */}
    <SimplifiedMetricCard
      icon="🏗️"
      title={language === 'en' ? 'Project Progress' : 'परियोजना प्रगति'}
      bigNumber={data.current.works_completed + data.current.works_ongoing}
      description={language === 'en' ? 'Total projects' : 'कुल परियोजनाएं'}
      tooltip={getTooltip('projectCompletion', language)}

      comparison={{
        completed: data.current.works_completed || 0,
        ongoing: data.current.works_ongoing || 0,
        completedLabel: language === 'en' ? 'Completed' : 'पूर्ण',
        ongoingLabel: language === 'en' ? 'Ongoing' : 'चल रही',
      }}
      language={language}
    />

    {/* Card 4: Women Participation */}
    <SimplifiedMetricCard
  icon="👩"
  title={language === 'en' ? 'Women Participation' : 'महिला भागीदारी'}
  bigNumber={`${Math.round(
    (data.current.women_persondays / data.current.person_days) * 100
  )}%`}
  description={
    language === 'en'
      ? 'Share of total work days'
      : 'कुल कार्य दिवसों का हिस्सा'
  }
  tooltip={
    language === 'en'
      ? 'Percentage of total person-days worked by women. This shows what proportion of all employment generated went to women workers. MGNREGA aims for at least 33% women participation.'
      : 'महिलाओं द्वारा काम किए गए कुल व्यक्ति-दिवसों का प्रतिशत। यह दर्शाता है कि उत्पन्न सभी रोजगार में से कितना हिस्सा महिला श्रमिकों को गया। मनरेगा कम से कम 33% महिला भागीदारी का लक्ष्य रखता है।'
  }
  progressBar={{
    value: Math.round(
      (data.current.women_persondays / data.current.person_days) * 100
    ),
    label: `${data.current.women_persondays.toLocaleString()} ${
      language === 'en' ? 'women person-days out of' : 'महिला व्यक्ति-दिवस में से'
    } ${data.current.person_days.toLocaleString()} ${
      language === 'en' ? 'total' : 'कुल'
    }`,
  }}
  language={language}
/>


    {/* Card 5: Average Wage */}
    <SimplifiedMetricCard
      icon="💵"
      title={language === 'en' ? 'Average Wage Rate' : 'औसत मजदूरी दर'}
      bigNumber={`₹${Number(data.current.avg_wage_rate || 0).toFixed(0)}`}
      description={language === 'en' ? 'Per person per day' : 'प्रति व्यक्ति प्रति दिन'}
      tooltip={getTooltip('avgWageRate', language)}
      status={{
        badge:
          data.current.avg_wage_rate >= 350
            ? language === 'en'
              ? 'EXCELLENT'
              : 'उत्कृष्ट'
            : language === 'en'
            ? 'GOOD'
            : 'अच्छा',
        color: data.current.avg_wage_rate >= 350 ? 'excellent' : 'good',
      }}
      language={language}
    />

    {/* Card 6: Total Person Days */}
    <SimplifiedMetricCard
      icon="📅"
      title={language === 'en' ? 'Total Person-Days' : 'कुल व्यक्ति-दिवस'}
      bigNumber={data.current.person_days || 0}
      description={
        language === 'en'
          ? 'Work days generated this month'
          : 'इस महीने उत्पन्न कार्य दिवस'
      }
      tooltip={getTooltip('personDays', language)}

      progressBar={{
        value: data.comparison
          ? Math.min(
              ((data.current.person_days - data.comparison.person_days_change) /
                data.current.person_days) *
                100,
              100
            )
          : 0,
        label: data.comparison
          ? `${
              data.comparison.person_days_change > 0 ? '+' : ''
            }${data.comparison.person_days_change.toLocaleString()} ${
              language === 'en' ? 'vs last month' : 'पिछले महीने की तुलना में'
            }`
          : '',
      }}
      language={language}
    />
  </div>
</div>


        {/* Section C: Monthly Trend View */}
        {trend.length > 0 && (
          <div className="mb-8">
            <SimpleTrendChart data={trend} language={language} />
          </div>
        )}

        {/* Section D: Inclusion & Diversity */}
        <div className="mb-8">
          <InclusionSection 
            data={{
              person_days: data.current.person_days,
              women_persondays: data.current.women_persondays,
              sc_persondays: data.current.sc_persondays,
              st_persondays: data.current.st_persondays,
            }}
            language={language}
          />
        </div>


        {/* Budget Breakdown */}
        <BudgetBreakdown 
  data={{
    total_exp: data.current.total_expenditure,
    wages: data.current.total_wages_paid,
    material_and_skilled_wages: data.current.material_expenditure,
    total_adm_expenditure: data.current.admin_expenditure,
    total_households_worked: data.current.households_provided,
  }}
  language={language}
/>

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
    </main>
  );
}
