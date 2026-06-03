import axios from 'axios';

const apiClient = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => {
    // 统一响应格式处理
    if (response.data && typeof response.data === 'object') {
      if (response.data.code !== 0) {
        return Promise.reject(new Error(response.data.message));
      }
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
