import axios from 'axios';
import CookieManager from '@react-native-cookies/cookies';

const api = axios.create({
  baseURL: 'http://10.0.2.2:8000',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(async (config) => {
  // You can add automatic token refresh or other global request logic here
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  // Handle global errors here
  return Promise.reject(error);
});

export const setXsrfToken = async () => {
  const cookies = await CookieManager.get('http://10.0.2.2:8000');
  const xsrfToken = cookies['XSRF-TOKEN']?.value;
  
  if (xsrfToken) {
    api.defaults.headers.common['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
  } else {
    console.warn('XSRF-TOKEN not found in cookies!');
  }
};

export default api;