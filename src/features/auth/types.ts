export interface AuthState {
  email: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string | null;
}
