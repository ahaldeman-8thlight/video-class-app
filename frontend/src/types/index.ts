export interface User {
  id: number;
  email: string;
  name: string;
  role: 'teacher' | 'student';
  created_at: string;
}

export interface VideoClass {
  id: number;
  title: string;
  description?: string;
  teacher_id: number;
  stream_call_id: string;
  scheduled_time?: string;
  duration_minutes?: number;
  is_active: boolean;
  join_link: string;
  created_at: string;
}

export interface ClassResponse {
  id: number;
  title: string;
  description: string;
  teacher_name: string;
  join_link: string;
  is_active: boolean;
  scheduled_time?: string;
}

export interface ClassCreate {
  title: string;
  description?: string;
  scheduled_time?: string;
  duration_minutes: number;
}

export interface StreamConfig {
  token: string;
  call_id: string;
  user_id: string;
  api_key: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
