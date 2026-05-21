import axios from 'axios';
import { storage } from '../utils/storage';
import Toast from 'react-native-toast-message';

const API_BASE_URL = 'https://api.freeapi.app';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Retry logic and Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Resilient Retry Mechanism (exponential backoff)
    // Retries on network disconnection, 429 Rate Limits, or 5xx Server Errors
    const status = error.response?.status;
    const shouldRetry = !error.response || status === 429 || (status >= 500 && status <= 599);

    if (shouldRetry && !axios.isCancel(error) && (!originalRequest._retryCount || originalRequest._retryCount < 2)) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      // Exponential backoff: 1s, then 2s
      await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retryCount));
      return apiClient(originalRequest);
    }

    // 2. Token Refresh Logic
    // Bypass token refresh logic for explicit authentication endpoints (login, register, refresh)
    const isAuthEndpoint =
      originalRequest.url?.includes('/api/v1/users/login') ||
      originalRequest.url?.includes('/api/v1/users/register') ||
      originalRequest.url?.includes('/api/v1/users/refresh-token');

    if (status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await storage.getToken('refreshToken');
        if (refreshToken) {
          // Attempt refresh
          const response = await axios.post(`${API_BASE_URL}/api/v1/users/refresh-token`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          await storage.setToken('accessToken', accessToken);
          await storage.setToken('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clean up user data and logout user completely
        await storage.deleteToken('accessToken');
        await storage.deleteToken('refreshToken');
        await storage.deleteData('user');
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Please log in again.',
        });
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
