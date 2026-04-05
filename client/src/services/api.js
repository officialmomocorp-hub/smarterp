import axios from 'axios';
import { useAuthStore } from '../store';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getStatistics: (params) => api.get('/students/statistics', { params }),
  getDefaulters: (params) => api.get('/students/defaulters', { params }),
  issueTC: (id, data) => api.post(`/pdf/tc/${id}`, data, { responseType: 'blob' }),
};

export const admissionAPI = {
  getAll: (params) => api.get('/admissions', { params }),
  getById: (id) => api.get(`/admissions/${id}`),
  create: (data) => api.post('/admissions', data),
  updateStatus: (id, data) => api.put(`/admissions/${id}/status`, data),
};

export const feeAPI = {
  getStructure: (params) => api.get('/fees/structure', { params }),
  createStructure: (data) => api.post('/fees/structure', data),
  processPayment: (data) => api.post('/fees/payment', data),
  getStudentFeeStatus: (studentId, params) => api.get(`/fees/student/${studentId}`, { params }),
  getDefaulters: (params) => api.get('/fees/defaulters', { params }),
  getCollectionReport: (params) => api.get('/fees/collection-report', { params }),
  createRazorpayOrder: (data) => api.post('/fees/razorpay/order', data),
  verifyRazorpayPayment: (data) => api.post('/fees/razorpay/verify', data),
};

export const attendanceAPI = {
  mark: (data) => api.post('/attendance/mark', data),
  getStudent: (studentId, params) => api.get(`/attendance/student/${studentId}`, { params }),
  getClass: (classId, params) => api.get(`/attendance/class/${classId}`, { params }),
  getMonthlyReport: (params) => api.get('/attendance/report/monthly', { params }),
  getAlerts: (params) => api.get('/attendance/alerts', { params }),
  applyLeave: (data) => api.post('/attendance/leave', data),
  getLeaves: (params) => api.get('/attendance/leave', { params }),
  approveLeave: (id, data) => api.put(`/attendance/leave/${id}/approve`, data),
};

export const examAPI = {
  getAll: (params) => api.get('/exams', { params }),
  create: (data) => api.post('/exams', data),
  enterMarks: (data) => api.post('/exams/marks', data),
  bulkEnterMarks: (data) => api.post('/exams/marks/bulk', data),
  getResult: (studentId, params) => api.get(`/exams/result/student/${studentId}`, { params }),
  getMeritList: (params) => api.get('/exams/merit-list', { params }),
  publishResults: (id) => api.post(`/exams/${id}/publish`),
};

export const dashboardAPI = {
  getAdmin: () => api.get('/dashboard/admin'),
  getTeacher: () => api.get('/dashboard/teacher'),
  getParent: () => api.get('/dashboard/parent'),
};

export const staffAPI = {
  getAll: (params) => api.get('/staff', { params }),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
};

export const noticeAPI = {
  getAll: (params) => api.get('/notices', { params }),
  create: (data) => api.post('/notices', data),
};

export const academicAPI = {
  getClasses: (params) => api.get('/academic/classes', { params }),
  createClass: (data) => api.post('/academic/classes', data),
  createSection: (data) => api.post('/academic/sections', data),
  createSubject: (data) => api.post('/academic/subjects', data),
  getAcademicYears: () => api.get('/academic/academic-years'),
  createAcademicYear: (data) => api.post('/academic/academic-years', data),
  createHomework: (data) => api.post('/academic/homework', data),
  submitHomework: (id, data) => api.post(`/academic/homework/${id}/submit`, data),
  getStudyMaterial: (params) => api.get('/academic/study-material', { params }),
};

export default api;
