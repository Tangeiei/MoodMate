export interface User {
  id: number;
  display_name: string;
  email: string;
  student_id?: string | null;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface RegisterRequest {
  display_name: string;
  email: string;
  password: string;
  confirm_password: string;
  student_id?: string;
  privacy_accepted: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfileResponse {
  success: boolean;
  data: User & {
    stats: {
      total_entries: number;
      total_activities: number;
      latest_mood?: {
        entry_date: string;
        mood_score: number;
        mood_label: string;
      } | null;
    };
  };
}
