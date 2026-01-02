export interface AuthUser {
  id: number;
  username?: string;
  name?: string;
  email?: string;
  firebase_uid?: string;
  photo_url?: string;
  provider?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthSession {
  token: string;
  access_token?: string;
  user: AuthUser;
}

export interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

export type LoginResponse = ApiResponse<AuthSession>;
