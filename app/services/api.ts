import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://gateway-service-production-37b5.up.railway.app/vms-api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach auth token if available
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  console.log('Token available:', !!token);
  console.log('AccessToken available:', !!accessToken);
  
  // Try both token and accessToken
  const authToken = token || accessToken;
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
    console.log('Authorization header set');
  } else {
    console.log('No token found - request may fail');
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url);
    console.error('Error response:', error.response?.data);
    console.error('Error message:', error.response?.data?.message);
    
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;