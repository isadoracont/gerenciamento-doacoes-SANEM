// Serviço de autenticação
import apiService from './api';
import { API_CONFIG } from '../config/api';

class AuthService {
  constructor() {
    this.tokenKey = 'auth_token';
    this.userKey = 'user_data';
    this.baseURL = API_CONFIG.BASE_URL;
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  getUser() {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  setAuthData(token, user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  clearAuthData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  async login(username, password) {
    try {
      if (!username || !password) {
        throw new Error('Usuário e senha são obrigatórios');
      }

      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: username, password: password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Usuário ou senha incorretos');
      }

      const data = await response.json();

      const user = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        perfilId: null
      };

      this.setAuthData(data.token, user);

      return { success: true, user, token: data.token };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  logout() {
    this.clearAuthData();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  async validateToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        this.clearAuthData();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro na validação do token:', error);
      return false;
    }
  }

  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

const authService = new AuthService();
export default authService;
