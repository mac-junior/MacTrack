import axiosInstance from './axiosConfig';

export const authApi = {
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};