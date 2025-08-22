import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setToken, loadTokenFromStorage } from "../api/client.js";
import { listUsers } from "../api/client.js";
import { getCsrfToken, resertCsrfToken } from "../api/csrf.js";
import { initLogging, setUserContext } from "../logging/sentry.js";

const AuthContext = createContext(null);

// localStorage helpers
function setStoredUsername(name) {
  if (name) localStorage.setItem("username", name);
  else localStorage.removeItem("username");
}
function getStoredUsername() {
  return localStorage.getItem("username");
}
// Avatar fallback
function withFallbackAvatar(u) {
  if (!u) return u;
  const hasAvatar = u.avatar && String(u.avatar).trim().length > 0;
  if (hasAvatar) return u;
  const seed = encodeURIComponent(u.username || "U");
  return {
    ...u,
    avatar: `https://i.pravatar.cc/150?u=${seed}`,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

//if token and username exist respond user
  useEffect(() => {
    (async () => {
      const t = loadTokenFromStorage();
      setIsAuthenticated(Boolean(t));
      const name = getStoredUsername();
      if (!t || !name) {
        setReady(true);
        return;
      }
      try {
        await reloadUser(name);
      } finally {
        setReady(true);
      }
    })();
  }, []);


  useEffect(() => {
    initLogging(user);
    setUserContext(user);
  }, [user?.userId, user?.username]);

  // Resolve user by username
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

    if (found) {
      setUser(
        withFallbackAvatar({
          userId: found.userId,
          username: found.username,
          avatar: found.avatar,
          email: found.email,
        })
      );
    } else {
      setUser(withFallbackAvatar({ username, userId: undefined, avatar: "" }));
    }
  }

  async function reloadUser(usernameOverride) {
    const name = (usernameOverride || getStoredUsername() || "").trim();
    if (!name) return;
    try {
      await resolveUserByUsername(name);
    } catch {

    }
  }

  async function register({ username, password, email, avatar }) {
    const csrfToken = getCsrfToken();
    const payload = {
      username: username.trim(),
      password,
      email,
      avatar:
        (avatar && avatar.trim()) ||
        `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`,
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
    // also clear Sentry user if enabled
    setUserContext(null);
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
