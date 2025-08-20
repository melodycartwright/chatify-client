
import axios from "axios";

const VITE_API_BASE_URL = "https://chatify-api.up.railway.app";

export const api = axios.create({
  baseURL: VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// ---- JWT storage + interceptor ----
let accessToken = null;

export function setToken(token) {
  accessToken = token || null;
  if (!token) localStorage.removeItem("access_token");
  else localStorage.setItem("access_token", token);
}

export function loadTokenFromStorage() {
  const saved = localStorage.getItem("access_token");
  accessToken = saved || null;
  return accessToken;
}

api.interceptors.request.use((config) => {
  const token = accessToken || localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export function hasToken() {
  return Boolean(accessToken || localStorage.getItem("access_token"));
}



// ---- API functions ----

// Users
export async function listUsers(params = {}) {
  const r = await api.get("/users", { params });
  return r.data;
}
export async function getUserById(userId) {
  const r = await api.get(`/users/${userId}`);
  return r.data;
}

// Conversations
export async function listConversations() {
  const r = await api.get("/conversations");
  return r.data;
}

// Messages 
export async function listMessages(conversationId) {
  const r = await api.get("/messages", { params: { conversationId } });
  return r.data;
}
export async function sendMessage({ conversationId, text }) {
  const r = await api.post("/messages", { text, conversationId });
  return r.data;
}
export async function deleteMessage(messageId) {
  const r = await api.delete(`/messages/${messageId}`);
  return r.data;
}

// Invites
export async function inviteUser({ userId, conversationId }) {
  const r = await api.post(`/invite/${userId}`, { conversationId });
  return r.data;
}
// Update user info
export async function updateUser({ userId, updatedData }) {
  const r = await api.put('/user', { userId, updatedData })
  return r.data
}

// Delete user
export async function deleteUserById(userId) {
  const r = await api.delete(`/users/${userId}`)
  return r.data
}

