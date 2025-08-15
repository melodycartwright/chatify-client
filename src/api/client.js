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
//helpers(messages, users, etc.)
export async function getMe() {
    const r = await api.get('/users/me');
    return r.data;  
}

export async function listUsers() {
    const r = await api.get('/users');
    return r.data;
}   

export async function listConversations() {
    const r = await api.get('/conversations');
    return r.data;
}
export async function listMessages(conversationId) {
  const r = await api.get("/messages", { params: { conversationId } });
  return r.data;
}

export async function sendMessage({ conversationId, text }) {
  // plural endpoint
  const r = await api.post("/messages", { text, conversationId });
  return r.data;
}
export async function deleteMessage(messageId) {
  // plural in path
  const r = await api.delete(`/messages/${messageId}`);
  return r.data;
}
export async function inviteUser({userId, conversationId}) {
  //body has to include the GUID convo id  
  const r = await api.post('/invite/${userId}', { conversationId })
    return r.data;
}

