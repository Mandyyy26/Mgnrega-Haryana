import { Language } from '@/types';

export const tooltips = {
  performanceScore: {
    en: 'Overall performance score calculated based on Wage Rate (30%), work availability (25%), project completion (25%), and women participation (20%).',
    hi: 'मजदूरी दर (30%), काम उपलब्धता (25%), परियोजना पूर्णता (25%), और महिला भागीदारी (20%) के आधार पर गणना किया गया समग्र प्रदर्शन स्कोर।',
  },
  timelyPayments: {
    en: 'Percentage of wage payments made within 15 days of work completion, as mandated by MGNREGA guidelines.',
    hi: 'मनरेगा दिशानिर्देशों के अनुसार कार्य पूर्ण होने के 15 दिनों के भीतर किए गए मजदूरी भुगतान का प्रतिशत।',
  },
  workAvailability: {
    en: 'Number of households that received employment under MGNREGA this month out of total job card holders.',
    hi: 'कुल जॉब कार्ड धारकों में से इस महीने मनरेगा के तहत रोजगार प्राप्त करने वाले परिवारों की संख्या।',
  },
  projectCompletion: {
    en: 'Percentage of projects completed versus ongoing projects. Higher completion rate indicates better project management.',
    hi: 'चल रही परियोजनाओं के मुकाबले पूर्ण की गई परियोजनाओं का प्रतिशत। उच्च पूर्णता दर बेहतर परियोजना प्रबंधन को दर्शाती है।',
  },
  womenParticipation: {
    en: 'Percentage of total person-days worked by women. MGNREGA aims for at least 33% women participation.',
    hi: 'महिलाओं द्वारा काम किए गए कुल व्यक्ति-दिवसों का प्रतिशत। मनरेगा कम से कम 33% महिला भागीदारी का लक्ष्य रखता है।',
  },
  householdsWorked: {
    en: 'Total number of unique households that received employment under MGNREGA during this month.',
    hi: 'इस महीने के दौरान मनरेगा के तहत रोजगार प्राप्त करने वाले अद्वितीय परिवारों की कुल संख्या।',
  },
  personDays: {
    en: 'Total person-days of employment generated. One person-day = one person working for one day.',
    hi: 'उत्पन्न रोजगार के कुल व्यक्ति-दिवस। एक व्यक्ति-दिवस = एक व्यक्ति एक दिन के लिए काम करता है।',
  },
  avgWageRate: {
    en: 'Average daily wage paid to workers. State governments set minimum wage rates as per MGNREGA Schedule II.',
    hi: 'श्रमिकों को दी जाने वाली औसत दैनिक मजदूरी। राज्य सरकारें मनरेगा अनुसूची II के अनुसार न्यूनतम मजदूरी दर निर्धारित करती हैं।',
  },
  worksCompleted: {
    en: 'Number of MGNREGA works/projects that have been completed and closed during this period.',
    hi: 'इस अवधि के दौरान पूर्ण और बंद की गई मनरेगा कार्यों/परियोजनाओं की संख्या।',
  },
  worksOngoing: {
    en: 'Number of MGNREGA works/projects currently in progress and not yet completed.',
    hi: 'वर्तमान में प्रगति पर और अभी तक पूर्ण नहीं हुई मनरेगा कार्यों/परियोजनाओं की संख्या।',
  },
  womenPersondays: {
    en: 'Total person-days of employment provided specifically to women workers under MGNREGA.',
    hi: 'मनरेगा के तहत विशेष रूप से महिला श्रमिकों को प्रदान किए गए रोजगार के कुल व्यक्ति-दिवस।',
  },
  totalProjects: {
    en: 'Total number of MGNREGA projects (both completed and ongoing) in the district.',
    hi: 'जिले में मनरेगा परियोजनाओं (पूर्ण और चल रही दोनों) की कुल संख्या।',
  },
  jobCardHolders: {
    en: 'Percentage of registered job card holders who received work during this month.',
    hi: 'इस महीने के दौरान काम प्राप्त करने वाले पंजीकृत जॉब कार्ड धारकों का प्रतिशत।',
  },
  householdIncome: {
    en: 'Average income earned per household through MGNREGA employment during this month.',
    hi: 'इस महीने के दौरान मनरेगा रोजगार के माध्यम से प्रति परिवार अर्जित औसत आय।',
  }
};

export function getTooltip(key: keyof typeof tooltips, language: Language): string {
  return tooltips[key][language];
}
