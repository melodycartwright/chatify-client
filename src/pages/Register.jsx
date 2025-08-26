import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { logError, logInfo } from "../logging/sentry.js";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  // ...existing code...
  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      await register({ username, password, email, avatar });
      logInfo("User registered", { username, email, avatar });
      navigate("/login", { replace: true });
    } catch (e) {
      const msg = e?.response?.data?.error || "Registration failed.";
      setNotice({ kind: "error", text: msg });
      logError(e, { where: "Register", username, email, avatar });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-center">
      <div className="register">
        <h1 className="Title">Create your account</h1>
        {notice && (
          <p style={{ color: notice.kind === "error" ? "#ef4444" : "#22c55e" }}>
            {notice.text}
          </p>
        )}
        <form onSubmit={onSubmit} className="register-form">
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Avatar URL (optional)"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="auth-footer">
          Have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
