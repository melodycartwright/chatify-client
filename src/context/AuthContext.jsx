import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setToken, loadTokenFromStorage } from "../api/client.js";
import { listUsers } from "../api/client.js";
import { getCsrfToken , resertCsrfToken} from "../api/csrf.js";

const AuthContext = createContext(null);

function setStoredUsername(name) {
  if (name) localStorage.setItem("username", name);
  else localStorage.removeItem("username");
}
function getStoredUsername() {
  return localStorage.getItem("username");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const t = loadTokenFromStorage();
    setIsAuthenticated(Boolean(t));
    const name = getStoredUsername();
    if (!t) {
      setReady(true);
      return;
    }
    if (name) reloadUser(name).finally(() => setReady(true));
    else setReady(true);
  }, []);

  async function resolveUserByUsername(username) {
    const data = await listUsers({ username, limit: 5 });
    const arr = Array.isArray(data)
      ? data
      : Array.isArray(data?.users)
      ? data.users
      : [];
    const found = arr.find(
      (u) => (u.username || "").toLowerCase() === username.toLowerCase()
    );
    if (found)
      setUser({
        userId: found.userId,
        username: found.username,
        avatar: found.avatar,
      });
    else setUser({ username });
  }

  async function reloadUser(usernameOverride) {
    const name = usernameOverride || getStoredUsername();
    if (!name) return;
    try {
      await resolveUserByUsername(name);
    } catch {
      /* keep last known */
    }
  }

  async function register({ username, password, email, avatar }) {
    const csrfToken = getCsrfToken();
    const payload = {
      username,
      password,
      email,
      avatar:
        avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`,
      csrfToken,
    };
    await api.post("/auth/register", payload);
  }

async function login({ username, password }) {
  const csrfToken = getCsrfToken();
  const uname = username.trim(); 
  const res = await api.post("/auth/token", {
    username: uname,
    password,
    csrfToken,
  });
  setToken(res.data?.token);
  setStoredUsername(uname);
  setIsAuthenticated(true);
  await reloadUser(uname);
}


  function logout() {
    setToken(null);
    setStoredUsername(null);
    setIsAuthenticated(false);
    setUser(null);
    resertCsrfToken();
  }

  const value = useMemo(
    () => ({
      user,
      ready,
      isAuthenticated,
      login,
      register,
      logout,
      reloadUser,
    }),
    [user, ready, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
