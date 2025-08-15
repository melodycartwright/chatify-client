import axios from 'axios';

const API_BASE= import.meta.env.VITE_API_BASE_URL 

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // API uses JWT in header, not HttpOnly cookie
});  
let accessToken= null;

export function setToken(token) {
    accessToken = token || null
if(!token)localStorage.removeItem('access_token')
    else localStorage.setItem('access_token', token)
}

export function loadTokenFromStorage() {
    const saved = localStorage.getItem('access_token')
   accessToken = saved || null;
   return accessToken;
}

//attach authorization
api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
})