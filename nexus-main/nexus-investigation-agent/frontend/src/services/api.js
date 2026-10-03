import axios from 'axios';

// Empty base URL keeps the browser on the same origin; Vite proxies /api to FastAPI in development.
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (usernameOrEmail, password) => {
  const resp = await api.post('/api/auth/login', {
    username_or_email: usernameOrEmail,
    password: password
  });
  return resp.data;
};

export const register = async (userData) => {
  const resp = await api.post('/api/auth/register', userData);
  return resp.data;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('nexus_token') || sessionStorage.getItem('nexus_token');
  const resp = await api.get('/api/auth/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return resp.data;
};

export const logoutApi = async () => {
  const token = localStorage.getItem('nexus_token') || sessionStorage.getItem('nexus_token');
  try {
    await api.post('/api/auth/logout', {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  } catch (e) {
    // ignore
  }
};

export const requestPasswordRecovery = async (email) => {
  const resp = await api.post('/api/auth/forgot-password', { email });
  return resp.data;
};

export const healthCheck = async () => {
  const resp = await api.get('/api/health');
  return resp.data;
};

export const getDashboardStats = async () => {
  const resp = await api.get('/api/dashboard/stats');
  return resp.data;
};

export const investigate = async (question) => {
  const resp = await api.post('/api/investigate', { question });
  return resp.data;
};

export const getInvestigations = async () => {
  const resp = await api.get('/api/investigations');
  return resp.data;
};

export const getInvestigation = async (id) => {
  const resp = await api.get(`/api/investigations/${id}`);
  return resp.data;
};

export const getSteps = async (id) => {
  const resp = await api.get(`/api/investigations/${id}/steps`);
  return resp.data;
};

export const getEvidence = async (id) => {
  const resp = await api.get(`/api/investigations/${id}/evidence`);
  return resp.data;
};

export const getGraph = async (id) => {
  const resp = await api.get(`/api/investigations/${id}/graph`);
  return resp.data;
};

export const getReport = async (id) => {
  const resp = await api.get(`/api/investigations/${id}/report`);
  return resp.data;
};

export const getDocuments = async (params = {}) => {
  const resp = await api.get('/api/documents', { params });
  return resp.data;
};

export const getDocument = async (id) => {
  const resp = await api.get(`/api/documents/${id}`);
  return resp.data;
};

export const uploadDocument = async (formData) => {
  const resp = await api.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return resp.data;
};

export const reindexDocument = async (id) => {
  const resp = await api.post(`/api/documents/${id}/reindex`);
  return resp.data;
};

export const deleteDocument = async (id) => {
  const resp = await api.delete(`/api/documents/${id}`);
  return resp.data;
};

export const getCriteria = async (params = {}) => {
  const resp = await api.get('/api/criteria', { params });
  return resp.data;
};

export const getCriterionDetail = async (id) => {
  const resp = await api.get(`/api/criteria/${id}`);
  return resp.data;
};

export const getEvaluationData = async () => {
  const resp = await api.get('/api/evaluation');
  return resp.data;
};

export const getAudit = async (params = {}) => {
  const resp = await api.get('/api/audit', { params });
  return resp.data;
};

export default api;
