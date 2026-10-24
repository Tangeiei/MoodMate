export interface MoodTrendPoint {
  date: string;
  mood_score: number;
  mood_label: string;
  stress_level?: number | null;
}

export interface FactorCount {
  id: number;
  name: string;
  count: number;
}

export interface MoodAnalyticsResponse {
  success: boolean;
  period: '7d' | '30d';
  summary: {
    total_entries: number;
    average_mood: string | null;
    average_stress: string | null;
  };
  trend: MoodTrendPoint[];
  distribution: {
    [score: number]: number;
  };
  top_factors: FactorCount[];
  insight: string;
}
