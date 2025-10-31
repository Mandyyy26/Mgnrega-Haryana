export interface PerformanceMetrics {
    person_days: number;
    households_provided: number;
    works_completed: number;
    works_ongoing: number;
    women_persondays: number;
    avg_wage_rate: number;
  }
  
  export interface ScoreResult {
    overall: number;
    label: string;
    color: string;
    emoji: string;
    breakdown: {
      payment: { score: number; label: string };
      work: { score: number; label: string };
      completion: { score: number; label: string };
      women: { score: number; label: string };
    };
  }
  
  export function calculatePerformanceScore(data: PerformanceMetrics): ScoreResult {
    // Payment Score (assume 100% if avg_wage_rate > 300)
    const paymentScore = data.avg_wage_rate >= 350 ? 10 : 
                         data.avg_wage_rate >= 300 ? 8 : 
                         data.avg_wage_rate >= 250 ? 6 : 4;
    
    const paymentLabel = paymentScore >= 8 ? 'EXCELLENT' : 
                         paymentScore >= 6 ? 'GOOD' : 'NEEDS IMPROVEMENT';
  
    // Work Availability Score (based on households served)
    const workScore = data.households_provided >= 5000 ? 10 :
                      data.households_provided >= 3000 ? 8 :
                      data.households_provided >= 1500 ? 6 : 4;
    
    const workLabel = workScore >= 8 ? 'HIGH' :
                      workScore >= 6 ? 'MEDIUM' : 'LOW';
  
    // Project Completion Score
    const totalWorks = data.works_completed + data.works_ongoing;
    const completionRate = totalWorks > 0 ? (data.works_completed / totalWorks) * 100 : 0;
    const completionScore = completionRate >= 50 ? 10 :
                            completionRate >= 35 ? 8 :
                            completionRate >= 20 ? 6 : 4;
    
    const completionLabel = completionScore >= 8 ? 'EXCELLENT' :
                            completionScore >= 6 ? 'GOOD' : 'NEEDS IMPROVEMENT';
  
    // Women Participation Score
    const womenRate = data.person_days > 0 ? (data.women_persondays / data.person_days) * 100 : 0;
    const womenScore = womenRate >= 60 ? 10 :
                       womenRate >= 45 ? 8 :
                       womenRate >= 30 ? 6 : 4;
    
    const womenLabel = womenScore >= 8 ? 'HIGH' :
                       womenScore >= 6 ? 'MEDIUM' : 'LOW';
  
    // Calculate overall score (weighted average)
    const overall = (paymentScore * 0.3 + workScore * 0.25 + completionScore * 0.25 + womenScore * 0.2);
  
    // Determine overall label
    const label = overall >= 8 ? 'EXCELLENT' :
                  overall >= 6 ? 'GOOD' :
                  overall >= 4 ? 'FAIR' : 'NEEDS IMPROVEMENT';
  
    const color = overall >= 8 ? '🟢' :
                  overall >= 6 ? '🟢' :
                  overall >= 4 ? '🟡' : '🔴';
  
    const emoji = overall >= 8 ? '🏆' :
                  overall >= 6 ? '👍' :
                  overall >= 4 ? '⚠️' : '📉';
  
    return {
      overall: Number(overall.toFixed(1)),
      label,
      color,
      emoji,
      breakdown: {
        payment: { score: paymentScore, label: paymentLabel },
        work: { score: workScore, label: workLabel },
        completion: { score: completionScore, label: completionLabel },
        women: { score: womenScore, label: womenLabel },
      },
    };
  }
  