import axios from 'axios';

/**
 * In development VITE_API_URL is empty and Vite proxies /api to the local
 * backend, so requests stay same-origin.
 *
 * In production it must be set to the deployed API origin (e.g.
 * https://scatch-api.onrender.com) in Vercel's environment variables.
 */
const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
});

/**
 * Normalises every failure into an Error carrying the server's message, so
 * components can show something useful instead of "Something went wrong".
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMessage = error.response?.data?.error;

    if (error.code === 'ECONNABORTED') {
      error.friendlyMessage = 'The server took too long to respond. Please try again.';
    } else if (!error.response) {
      error.friendlyMessage = 'Cannot reach the server. Is the backend running?';
    } else if (error.response.status === 401) {
      error.friendlyMessage = serverMessage || 'Please log in to continue.';
    } else {
      error.friendlyMessage = serverMessage || `Request failed (${error.response.status}).`;
    }

    return Promise.reject(error);
  }
);

export default api;