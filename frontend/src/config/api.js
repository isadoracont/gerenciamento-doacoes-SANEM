// Configuração da API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
};

export const ENDPOINTS = {
  DONORS: '/donor',
  ITEMS: '/item',
  USERS: '/user',
  CATEGORIES: '/category',
  PROFILES: '/profile',
  CARDS: '/card',
};
