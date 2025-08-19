import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getUserById, updateUser, deleteUserById } from "../api/client.js";

const USER_RE = /^[a-zA-Z0-9._-]{3,24}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Profile() {
  const { user, ready, logout, reloadUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [form, setForm] = useState({ username: "", email: "", avatar: "" });
  const [confirmText, setConfirmText] = useState("");

  const isValid = useMemo(() => {
    const u = form.username.trim();
    const e = form.email.trim();
    return USER_RE.test(u) && EMAIL_RE.test(e);
  }, [form]);

  useEffect(() => {
    let cancel = false;
    async function load() {
      if (!ready) return;
      if (!user?.userId) {
        setLoading(false);
        return;
      } // fallback: minimal edit
      setLoading(true);
      setError(null);
      try {
        const data = await getUserById(user.userId);
        if (!cancel && data) {
          setForm({
            username: data.username || user.username || "",
            email: data.email || "",
            avatar: data.avatar || "",
          });
        }
      } catch (e) {
        if (!cancel) setError("Failed to load profile");
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, [ready, user?.userId]);

  async function onSave(e) {
    e.preventDefault();
    if (!user?.userId) return;
    if (!isValid) {
      setError("Please fix validation errors before saving.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const desired = {
        username: form.username.trim(),
        email: form.email.trim(),
        avatar:
          form.avatar.trim() ||
          `https://i.pravatar.cc/150?u=${encodeURIComponent(
            form.username.trim()
          )}`,
      };
      await updateUser({ userId: user.userId, updatedData: desired });
      // if username changed, make sure auth state reflects it
      await reloadUser(desired.username);
    } catch (e) {
      const msg =
        e?.response?.data?.error || e?.message || "Failed to update profile";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!user?.userId) return;
    if (confirmText !== "DELETE") {
      setError("Type DELETE to confirm.");
      return;
    }
    setRemoving(true);
    setError(null);
    try {
      await deleteUserById(user.userId);
      logout();
      navigate("/register", { replace: true });
    } catch (e) {
      const msg =
        e?.response?.data?.error || e?.message || "Failed to delete user";
      setError(msg);
    } finally {
      setRemoving(false);
    }
  }

  if (!ready) return <div>Loading…</div>;
  if (loading) return <div>Loading profile…</div>;

  return (
    <div style={{ maxWidth: 520 }}>
      <h1>Profile</h1>

      <form onSubmit={onSave} noValidate>
        <label>
          Username
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Username"
            autoComplete="username"
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            autoComplete="email"
          />
        </label>

        <label>
          Avatar URL
          <input
            type="url"
            value={form.avatar}
            onChange={(e) => setForm({ ...form, avatar: e.target.value })}
            placeholder="https://…"
          />
        </label>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            margin: "8px 0",
          }}
        >
          {form.avatar ? (
            <img
              src={form.avatar}
              alt=""
              width="48"
              height="48"
              style={{ borderRadius: 8 }}
            />
          ) : null}
          <button type="submit" disabled={!isValid || saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      <hr style={{ margin: "16px 0" }} />

      <h2>Delete your account</h2>
      <p>
        Type <code>DELETE</code> and press the button to permanently remove your
        account.
      </p>
      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="DELETE"
      />
      <button
        onClick={onDelete}
        disabled={removing || confirmText !== "DELETE"}
      >
        {removing ? "Deleting…" : "Delete account"}
      </button>

      {error && <p style={{ color: "#a00", marginTop: 12 }}>{error}</p>}
    </div>
  );
}
