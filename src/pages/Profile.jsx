import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { updateUserInfo, deleteUserById } from "../api/client.js";
import { loadTokenFromStorage } from "../api/client.js";

function tokenUserId() {
  const t = loadTokenFromStorage();
  if (!t) return undefined;
  try {
    const payload = JSON.parse(atob(t.split(".")[1] || ""));
    const raw =
      payload?.userId ??
      payload?.userid ??
      payload?.userID ??
      payload?.id ??
      payload?.sub;
    const id = Number(raw);
    return Number.isFinite(id) ? id : undefined;
  } catch {
    return undefined;
  }
}

export default function Profile() {
  const { user, reloadUser, logout } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  function currentId() {
    const id = Number(user?.userId ?? tokenUserId());
    return Number.isInteger(id) ? id : undefined;
  }

  async function onSave(e) {
    e.preventDefault();
    const id = currentId();
    if (!id) {
      setNotice({
        kind: "error",
        text: "Missing user ID. Try reloading or re-login.",
      });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      await updateUserInfo({ userId: id, username, email, avatar });
      await reloadUser(username);
      setNotice({ kind: "success", text: "Profile updated." });
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Update failed.";
      setNotice({ kind: "error", text: msg });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    const id = currentId();
    if (!id) {
      setNotice({
        kind: "error",
        text: "Missing user ID. Try reloading or re-login.",
      });
      return;
    }
    if (deleteConfirm !== "DELETE") {
      setNotice({ kind: "error", text: "Type DELETE to confirm." });
      return;
    }
    setDeleting(true);
    setNotice(null);
    try {
      await deleteUserById(id);
      logout();
      navigate("/login", { replace: true });
      setTimeout(() => {
        if (!/\/login$/.test(location.pathname)) location.assign("/login");
      }, 50);
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Delete failed.";
      setNotice({ kind: "error", text: msg });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <h1>Profile</h1>

      {notice && (
        <p style={{ color: notice.kind === "error" ? "#ef4444" : "#22c55e" }}>
          {notice.text}
        </p>
      )}

      <form
        onSubmit={onSave}
        style={{ display: "grid", gap: 10, maxWidth: 420 }}
      >
        <label>
          <div>Username</div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            autoComplete="username"
          />
        </label>

        <label>
          <div>Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
          />
        </label>

        <label>
          <div>Avatar URL</div>
          <input
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://…"
            autoComplete="photo"
          />
        </label>

        <div>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      <hr style={{ margin: "20px 0" }} />

      <section>
        <h2>Delete your account</h2>
        <p>
          Type <code>DELETE</code> and press the button to permanently remove
          your account.
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="DELETE"
          />
          <button
            className="btn btn--danger"
            onClick={onDelete}
            disabled={deleting}
            type="button"
          >
            {deleting ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </section>
    </div>
  );
}
