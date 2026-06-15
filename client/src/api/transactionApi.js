import axiosInstance from './axiosConfig';

export const transactionApi = {
  createManual: async (data) => {
    const response = await axiosInstance.post('/transactions/manual', data);
    return response.data;
  },
  
  parseSms: async (smsMessage, confirmedData = null) => {
    const response = await axiosInstance.post('/transactions/parse-sms', {
      smsMessage,
      userConfirmedData: confirmedData
    });
    return response.data;
  },
  
  getToday: async () => {
    const response = await axiosInstance.get('/transactions/today');
    return response.data;
  },
  
  getAll: async (page = 1, limit = 50, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await axiosInstance.get('/transactions', { params });
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await axiosInstance.put(`/transactions/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axiosInstance.delete(`/transactions/${id}`);
    return response.data;
  },
  
  getCategories: async () => {
    const response = await axiosInstance.get('/transactions/categories');
    return response.data;
  }
};