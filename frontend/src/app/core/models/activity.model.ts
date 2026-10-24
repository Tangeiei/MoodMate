export interface SelfCareActivity {
  id: number;
  title: string;
  description: string;
  category: string;
  completed_today?: boolean;
}

export interface ActivityHistoryItem {
  id: number;
  completed_at: string;
  title: string;
  category: string;
}

export interface ActivityListResponse {
  success: boolean;
  data: SelfCareActivity[];
}

export interface ActivityHistoryResponse {
  success: boolean;
  data: ActivityHistoryItem[];
}
