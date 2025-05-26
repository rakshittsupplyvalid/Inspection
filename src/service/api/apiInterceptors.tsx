// src/services/apiClient.ts
import axios from 'axios';
import MMKVStorage from 'react-native-mmkv-storage';

const storage = new MMKVStorage.Loader().initialize();

const apiClient = axios.create({
  baseURL: 'https://dev-backend-2025.epravaha.com',
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getString('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.removeItem('userToken');
      // You can add navigation logic here if needed
    }
    return Promise.reject(error);
  }
);

export default apiClient;