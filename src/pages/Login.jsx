import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      await login({ username, password });
      navigate("/chat", { replace: true });
    } catch (e) {
      const msg = e?.response?.data?.error || "Login failed.";
      setNotice({ kind: "error", text: msg });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-center">
      <div className="register">
        <h1 className="Title">Welcome back</h1>
        {notice && (
          <p style={{ color: notice.kind === "error" ? "#ef4444" : "#22c55e" }}>
            {notice.text}
          </p>
        )}
        <form onSubmit={onSubmit} className="register-form">
          <input
            className="login-username"
            placeholder="Username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="login-password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="auth-footer">
          No account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
