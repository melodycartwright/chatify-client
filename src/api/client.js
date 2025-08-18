// src/api/client.js
import axios from "axios";

const API_BASE = "https://chatify-api.up.railway.app";

export const api = axios.create({
  baseURL: API_BASE,
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
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// ---- Chatify API helpers ----

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

// Messages (NOTE: plural endpoints)
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
