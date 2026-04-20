// Serviço de autenticação
import apiService from './api';
import { API_CONFIG } from '../config/api';

class AuthService {
  constructor() {
    this.tokenKey = 'auth_token';
    this.userKey = 'user_data';
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Verifica se o usuário está autenticado
  isAuthenticated() {
    return !!this.getToken();
  }

  // Obtém o token de autenticação
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  // Obtém os dados do usuário
  getUser() {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  // Salva o token e dados do usuário
  setAuthData(token, user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  // Remove os dados de autenticação
  clearAuthData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  // Login com usuário e senha
  async login(username, password) {
    try {
      if (!username || !password) {
        throw new Error('Usuário e senha são obrigatórios');
      }

      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: username,
          password: password
        })
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
        role: data.role, // Nome do perfil (ex: "Administrador", "Atendente")
        perfilId: null // Será preenchido quando buscar dados completos do usuário
      };

      this.setAuthData(data.token, user);

      return {
        success: true,
        user: user,
        token: data.token
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  // Logout
  logout() {
    this.clearAuthData();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  // Verifica se o token é válido
  async validateToken() {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Erro na validação do token:', error);
      return false;
    }
  }

  // Obtém o header de autorização para requisições
  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Instância singleton do serviço
const authService = new AuthService();
export default authService;
