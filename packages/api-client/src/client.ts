import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { resolveMock } from './mock/handlers';

const getBaseURL = () =>
  process.env.NEXT_PUBLIC_API_URL || '/api';

const isMockEnabled = () =>
  process.env.NEXT_PUBLIC_MOCK_API === 'true';

const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getBaseURL(),
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
    timeout: 30000,
  });

  // ── Mock interceptor (runs before the real request) ───────────────────────
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (isMockEnabled()) {
        const url = (config.url ?? '') + (config.params ? '?' + new URLSearchParams(config.params).toString() : '');
        const mock = resolveMock(config.method ?? 'get', url, config.data);
        if (mock) {
          // Simulate a small network delay (100–300 ms)
          await new Promise((r) => setTimeout(r, 100 + Math.random() * 200));
          // Throw a "resolved" response by using axios's adapter trick
          const response = {
            data: mock,
            status: parseInt(mock.code, 10) || 200,
            statusText: 'OK',
            headers: {},
            config,
          };
          // Returning via a cancelled request with resolved data, rejecting on non-2xx status codes
          config.adapter = () => {
            const status = parseInt(mock.code, 10) || 200;
            if (status >= 200 && status < 300) {
              return Promise.resolve(response);
            } else {
              // Properly reject mock errors to match standard axios behavior
              const err = new Error(mock.message || 'Request failed') as any;
              err.response = response;
              err.status = status;
              err.config = config;
              err.code = mock.code;
              return Promise.reject(err);
            }
          };
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ── Auth token injection ───────────────────────────────────────────────────
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ── Response envelope unwrapper ──────────────────────────────────────────
  instance.interceptors.response.use(
    (response) => {
      if (
        response.data &&
        typeof response.data === 'object' &&
        'code' in response.data &&
        'message' in response.data &&
        'data' in response.data
      ) {
        response.data = response.data.data;
      }
      return response;
    },
    (error) => Promise.reject(error)
  );

  // ── 401 redirect ──────────────────────────────────────────────────────────
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/auth/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const apiClient = createApiClient();

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
    // Also write to cookie so Next.js middleware (server-edge) can read it
    document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }
};

export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Expire the cookie
    document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
  }
};

export default apiClient;
