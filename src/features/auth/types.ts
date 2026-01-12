export interface AuthState {
  email: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string | null;
}
