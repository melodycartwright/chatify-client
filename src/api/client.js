
import axios from "axios";
import { logError } from "../logging/sentry.js";

export const VITE_API_BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL?.trim() ||
  "https://chatify-api.up.railway.app";

export const api = axios.create({
  baseURL: VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// JWT storage + interceptor
let accessToken = null;

export function setToken(token) {
  accessToken = token || null;
  setStoredJwt(token);
}

export function loadTokenFromStorage() {
  const saved = getStoredJwt();
  accessToken = saved || null;
  return accessToken;
}
const JWT_KEY = "jwt";

function getStoredJwt() {
  return sessionStorage.getItem(JWT_KEY);
}

function setStoredJwt(token) {
  if (!token) sessionStorage.removeItem(JWT_KEY);
  else sessionStorage.setItem(JWT_KEY, token);
}

api.interceptors.request.use((config) => {
  const token = accessToken || getStoredJwt();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

//login failed, not responding
api.interceptors.response.use(
  (r) => r,
  (error) => {
    try {
      logError(error, {
        url: error?.config?.url,
        method: error?.config?.method,
        status: error?.response?.status,
        data: error?.response?.data,
      });
    } catch {}
    return Promise.reject(error);
  }
);


export function hasToken() {
  return Boolean(accessToken || getStoredJwt());
}


// Users
export async function listUsers(params = {}) {
  const r = await api.get("/users", { params });
  return r.data;
}
export async function getUserById(userId) {
  const r = await api.get(`/users/${userId}`);
  return r.data;
}

export async function getMe() {
  const r = await api.get("/user");
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

// Profile
export async function updateUserInfo({ userId, username, email, avatar }) {
  const payload = { userId: Number(userId), updatedData: {} };
  if (username != null) payload.updatedData.username = String(username).trim();
  if (email != null) payload.updatedData.email = String(email).trim();
  if (avatar != null) payload.updatedData.avatar = String(avatar).trim();
  const r = await api.put("/user", payload);
  return r.data;
}
export async function deleteUserById(userId) {
  const r = await api.delete(`/users/${Number(userId)}`);
  return r.data;
}
