export interface District {
    district_code: string;
    name: string;
    name_hi: string;
    centroid_lat?: number;
    centroid_lng?: number;
  }
  
  export interface DistrictData {
    district: District;
    current: {
      month: number;
      fin_year: string;
      households_provided: number;
      person_days: number;
      avg_wage_rate: number;
      works_completed: number;
      works_ongoing: number;
      women_persondays: number;
    };
    comparison: {
      households_change: number;
      person_days_change: number;
    } | null;
  }
  
  export interface RankingDistrict {
    district_code: string;
    name: string;
    name_hi: string;
    person_days: number;
    households_provided: number;
  }
  
  export type Language = 'en' | 'hi';
  