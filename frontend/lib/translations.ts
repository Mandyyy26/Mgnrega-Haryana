export const translations = {
    en: {
      title: 'Haryana MGNREGA Performance',
      subtitle: 'Track employment guarantee scheme progress in your district',
      districts: 'Districts',
      records: 'Records',
      months: 'Months',
      householdsWorked: 'Households Worked',
      individualsWorked: 'Individuals Worked',
      avgWage: 'Average Wage Rate',
      worksCompleted: 'Works Completed',
      worksOngoing: 'Ongoing Works',
      womenPersondays: 'Women Person-Days',
      selectDistrict: 'Select Your District',
      topPerformers: 'Top 5 Performing Districts',
      haryana: 'Haryana'
    },
    hi: {
      title: 'हरियाणा मनरेगा प्रदर्शन',
      subtitle: 'अपने जिले में रोजगार गारंटी योजना की प्रगति ट्रैक करें',
      districts: 'जिले',
      records: 'रिकॉर्ड',
      months: 'महीने',
      householdsWorked: 'काम करने वाले परिवार',
      individualsWorked: 'काम करने वाले व्यक्ति',
      avgWage: 'औसत मजदूरी दर',
      worksCompleted: 'पूर्ण कार्य',
      worksOngoing: 'चल रहे कार्य',
      womenPersondays: 'महिला व्यक्ति-दिवस',
      selectDistrict: 'अपना जिला चुनें',
      topPerformers: 'शीर्ष 5 प्रदर्शन करने वाले जिले',
      haryana: 'हरियाणा',
    },
  };
  
  export type Language = 'en' | 'hi';
  
  export function t(lang: Language, key: keyof typeof translations.en): string {
    return translations[lang][key];
  }
  