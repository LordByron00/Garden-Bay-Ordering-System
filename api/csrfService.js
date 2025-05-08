import api from './apiClient';

export const fetchCsrfToken = async () => {
  console.log('[1/4] Getting CSRF token...');
  console.log('API Base URL:', api.defaults.baseURL);

  await api.get('/sanctum/csrf-cookie', { timeout: 10000 });
  console.log('CSRF token call completed.');
};