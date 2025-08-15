import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";

const USER_RE = /^[a-zA-Z0-9._-]{3,24}$/;
const PASS_RE =
  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-={}\[\]|;:'",.<>/?`~]{8,64}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    avatar: "",
  });
  const [error, setError] = useState(null);
  const [hints, setHints] = useState([]);

  const suggestedAvatar = useMemo(
    () =>
      form.username
        ? `https://i.pravatar.cc/150?u=${encodeURIComponent(form.username)}`
        : "",
    [form.username]
  );

  function validateLocal() {
    const errs = [];
    if (!USER_RE.test(form.username))
      errs.push("Username: 3–24 chars, letters/numbers/._- only.");
    if (!EMAIL_RE.test(form.email)) errs.push("Enter a valid email address.");
    if (!PASS_RE.test(form.password))
      errs.push(
        "Password: 8–64 chars, include at least one letter and one number."
      );
    setHints(errs);
    return errs.length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!validateLocal()) return;
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        avatar: form.avatar.trim() || suggestedAvatar,
      });
      navigate("/login");
    } catch (err) {
      const msg = err?.message || "Registration failed";
      setError(msg);
      console.error("Register error:", err?.response?.data || err); // TEMP
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <h1>Register</h1>

      <input
        placeholder="Username"
        autoComplete="username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />

      <input
        placeholder="Email"
        type="email"
        autoComplete="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        placeholder="Password"
        type="password"
        autoComplete="new-password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <input
        placeholder="Avatar URL (optional)"
        type="url"
        value={form.avatar}
        onChange={(e) => setForm({ ...form, avatar: e.target.value })}
      />
      {suggestedAvatar && !form.avatar && (
        <p style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
          Will use: <code>{suggestedAvatar}</code>
        </p>
      )}

      <button type="submit">Create account</button>

      {hints.length > 0 && (
        <ul style={{ marginTop: 8 }}>
          {hints.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}
      {error && <p style={{ color: "#a00", marginTop: 8 }}>{error}</p>}

      <p style={{ marginTop: 12 }}>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}
