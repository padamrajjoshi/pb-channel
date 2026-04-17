import axios from "axios";
import { encodePath, OBFUSCATED_BASE } from "@/lib/url-map";

// All API calls go to /{OBFUSCATED_BASE}/... — the middleware rewrites it to /api/...
// then the proxy decodes the path segment and forwards to the backend.
const API_BASE_URL = `/${OBFUSCATED_BASE}`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token refresh state
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(undefined));
  failedQueue = [];
};

// Obfuscated paths for auth endpoints used in the interceptor check
const OBF_REFRESH  = encodePath("/auth/refresh-token");
const OBF_LOGOUT   = encodePath("/auth/logout");
const OBF_OTP      = encodePath("/auth/otp-login");
const OBF_VERIFY   = encodePath("/auth/verify-otp");
const OBF_LOGIN    = encodePath("/auth/login");

// Auto-refresh interceptor: on 401, try refresh-token before redirecting to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    const status = error.response?.status;
    const url = originalRequest?.url ?? '';

    const isAuthEndpoint =
      url.includes(OBF_REFRESH) ||
      url.includes(OBF_LOGOUT)  ||
      url.includes(OBF_OTP)     ||
      url.includes(OBF_VERIFY)  ||
      url.includes(OBF_LOGIN);

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post(encodePath("/auth/refresh-token"));
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Helper to handle API errors consistently
export const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.detail || error.message;
  }
  return "An unexpected error occurred.";
};
