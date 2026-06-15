import axiosInstance from './axiosConfig';

export const snapshotApi = {
  getToday: async () => {
    const response = await axiosInstance.get('/snapshots/today');
    return response.data;
  },
  
  getByDate: async (date) => {
    const response = await axiosInstance.get(`/snapshots/${date}`);
    return response.data;
  },
  
  getHistory: async (limit = 30) => {
    const response = await axiosInstance.get('/snapshots/history', { params: { limit } });
    return response.data;
  },
  
  getSummary: async () => {
    const response = await axiosInstance.get('/snapshots/summary');
    return response.data;
  },
  
  forceCreate: async (date) => {
    const response = await axiosInstance.post('/snapshots/create', { date });
    return response.data;
  }
};