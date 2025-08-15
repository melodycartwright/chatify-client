import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {api, setToken, loadTokenFromStorage} from '../api/client.js';
import { getCsrfToken } from '../api/csrf.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setready] = useState(false);

  useEffect(() => {
    const t= loadTokenFromStorage();
    if (t) fetchModule().finally(() => setready(true));
    else setready(true);    
  }, [])

  async function fetchMe(){
    try{
        const response = await api.get('/users/me');
        setUser(response.data);
    } catch {
        setToken(null)
        setUser(null)
    }
  }

async function register({ username, password, email, avatar }) {
  const csrfToken = getCsrfToken();
  try {

    const payload = {
      username,
      password,
      email,
      avatar:
        avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`,
      csrfToken,
    };
    await api.post("/auth/register", payload);
  } catch (err) {
    const msg = err?.response?.data?.error || err?.message || "Register failed";
    throw new Error(msg);
  }
}


  async function login({username, password}) {
    const csrfToken = getCsrfToken();
    const response = await api.post('/auth/token', { username, password, csrfToken });
    setToken(response.data?.token);
    await fetchMe();
  }
  function logout() {
    setToken(null);
    setUser(null);
  }
  const value = useMemo(() => ({
    user,ready, login, register, logout}), [user, ready])
    return <AuthContext.Provider value={value}>
      {children}</AuthContext.Provider>
}

export function useAuth() {
    return useContext(AuthContext);
}

  
  