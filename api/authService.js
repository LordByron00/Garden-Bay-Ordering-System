import api from './apiClient';

export const login = async (email, password) => {
  try {
    const response = await api.post('api/login', {
      email,
      password
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('api/logout');
  } catch (error) {
    throw error;
  }
};