export interface MoodFactor {
  id: number;
  name: string;
  is_active?: boolean;
}

export interface MoodEntry {
  id: number;
  entry_date: string;
  mood_score: number; // 1-5
  mood_label: string; // แย่มาก, ไม่ค่อยดี, ปกติ, ดี, ดีมาก
  stress_level?: number | null; // 1-5
  journal_text?: string | null;
  created_at?: string;
  updated_at?: string;
  factor_names?: string[];
  factor_ids?: number[];
  factors?: MoodFactor[];
}

export interface CreateMoodRequest {
  entry_date: string;
  mood_score: number;
  mood_label?: string;
  stress_level?: number | null;
  journal_text?: string | null;
  factor_ids?: number[];
}

export interface MoodPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MoodListResponse {
  success: boolean;
  data: MoodEntry[];
  pagination: MoodPagination;
}

export interface MoodDetailResponse {
  success: boolean;
  data: MoodEntry;
}
