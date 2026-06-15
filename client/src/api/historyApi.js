import axiosInstance from './axiosConfig';

export const historyApi = {
  getWeeks: async (year) => {
    const response = await axiosInstance.get('/history/weeks', { params: { year } });
    return response.data;
  },
  
  getWeekDetails: async (weekStart, weekEnd, page = 1, limit = 50) => {
    const response = await axiosInstance.get(`/history/week/${weekStart}/${weekEnd}`, {
      params: { page, limit }
    });
    return response.data;
  },
  
  getMonthSummary: async (year, month) => {
    const response = await axiosInstance.get(`/history/month/${year}/${month}`);
    return response.data;
  },
  
  getYearSummary: async (year) => {
    const response = await axiosInstance.get(`/history/year/${year}`);
    return response.data;
  },
  
  search: async (filters) => {
    const response = await axiosInstance.get('/history/search', { params: filters });
    return response.data;
  },
  
  getInsights: async (period = 'month') => {
    const response = await axiosInstance.get('/history/insights', { params: { period } });
    return response.data;
  },
  
  exportToCsv: async (startDate, endDate) => {
    const response = await axiosInstance.get('/history/export', {
      params: { startDate, endDate, format: 'csv' },
      responseType: 'blob'
    });
    return response.data;
  }
};