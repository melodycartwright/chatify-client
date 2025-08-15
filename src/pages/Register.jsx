import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await register(form);
      navigate("/login");
    } catch {
      setError("Registration failed");
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Register</h1>
      <input
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button type="submit">Create account</button>
      {error && <p>{error}</p>}
      <p>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}
