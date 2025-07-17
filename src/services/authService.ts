import { apiService } from './api';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  kyc_status: string;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

class AuthService {
  async signUp(username: string, email: string, password: string) {
    try {
      const user = await apiService.post('/users/register', {
        username,
        email,
        password
      });
      
      // Store token if registration includes login
      if (user.access_token) {
        localStorage.setItem('access_token', user.access_token);
      }
      
      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  async signIn(username: string, password: string) {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/users/login', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      
      // Store the token
      localStorage.setItem('access_token', data.access_token);
      
      return { user: data, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  async signOut() {
    try {
      localStorage.removeItem('access_token');
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return null;

      // For now, we'll decode the JWT to get user info
      // In a real app, you might want a /me endpoint
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        username: payload.sub,
        email: payload.email || '',
        is_active: true,
        is_verified: false,
        kyc_status: 'pending',
        created_at: new Date().toISOString()
      };
    } catch (error) {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const authService = new AuthService(); 