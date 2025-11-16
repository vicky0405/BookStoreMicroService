import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Debug logger
const debugLog = (message, data) => {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, message, data };
  console.log(`[${timestamp}] ${message}`, data);
  
  // Lưu vào localStorage để xem sau
  try {
    const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
    logs.push(logEntry);
    // Chỉ giữ 50 logs gần nhất
    if (logs.length > 50) logs.shift();
    localStorage.setItem('debug_logs', JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save debug log:', e);
  }
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi 401
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || 'unknown';
      const isLoginRequest = requestUrl.includes('/auth/login');
      const isValidateToken = requestUrl.includes('/auth/validate-token');

      debugLog('[AXIOS INTERCEPTOR] 401 Error', {
        url: requestUrl,
        fullUrl: (error.config?.baseURL || '') + requestUrl,
        isLoginRequest,
        isValidateToken,
        pathname: window.location.pathname,
        hasToken: !!localStorage.getItem('token'),
        hasUser: !!localStorage.getItem('user')
      });

      // Không tự redirect nữa. Để phần gọi xử lý tuỳ ngữ cảnh.
      // Riêng validate-token sẽ được AuthContext xử lý clear auth.
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { debugLog };
