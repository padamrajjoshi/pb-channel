import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Zero-Trust Interceptor to handle authentication failures natively over cookies
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const isLoginPath = window.location.pathname.startsWith("/login");
        
        // Skip redirect if already on login page or if it's a background profile check
        // that's expected to fail when unauthenticated.
        if (!isLoginPath && !error.config?.url?.includes("/user/profile")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper to handle API errors consistently
export const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.detail || error.message;
  }
  return "An unexpected error occurred.";
};
