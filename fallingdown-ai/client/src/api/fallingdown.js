import axios from 'axios';

// Default to gateway proxy
const API_BASE = import.meta.env.VITE_NODE_API_URL || 'http://localhost:4000';
const ML_BASE = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000';

// Request interceptor to automatically attach authorization header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const checkMLStatus = () => axios.get(`${API_BASE}/api/status`);

export const fetchLogs = () => axios.get(`${API_BASE}/api/logs`);

export const postIncident = (data) => axios.post(`${API_BASE}/api/incident`, data);

export const uploadPhoto = (formData) => axios.post(`${ML_BASE}/api/upload`, formData);

export const fetchLeads = () => axios.get(`${API_BASE}/api/leads`);

export const submitLead = (data) => axios.post(`${API_BASE}/api/leads`, data);

export const sendChatMessage = (message, history) =>
  axios.post(`${API_BASE}/api/chat`, { message, history });

export const getImageUrl = (filename) => `${ML_BASE}/uploads/${filename}`;

export const deleteIncident = (id) => axios.delete(`${API_BASE}/api/incident/${id}`);

export const deleteIncidentImage = (id) => axios.delete(`${API_BASE}/api/incident/${id}/image`);

// Auth Endpoints
export const registerUser = (data) => axios.post(`${API_BASE}/api/auth/register`, data);
export const loginUser = (data) => axios.post(`${API_BASE}/api/auth/login`, data);
export const loginWithPasscode = (data) => axios.post(`${API_BASE}/api/auth/login-passcode`, data);
export const loginWithSSO = (data) => axios.post(`${API_BASE}/api/auth/sso`, data);
export const getProfile = () => axios.get(`${API_BASE}/api/auth/me`);
export const fetchUsers = () => axios.get(`${API_BASE}/api/auth/users`);
