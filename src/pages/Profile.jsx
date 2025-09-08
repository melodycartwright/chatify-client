import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { updateUserInfo, deleteUserById } from "../api/client.js";
import { logError, logInfo } from "../logging/sentry.js";
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
  const avatarImgRef = useRef(null);
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

  // ...existing code...

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
      logInfo("Account deleted", { userId: id });
      setNotice({ kind: "success", text: "Account deleted. Logging out…" });
      setTimeout(() => {
        logout();
        navigate("/register");
      }, 1200);
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Delete failed.";
      setNotice({ kind: "error", text: msg });
      logError(e, { where: "Profile delete", userId: id });
    } finally {
      setDeleting(false);
    }
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
      logInfo("Profile updated", { userId: id, username, email, avatar });
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Update failed.";
      setNotice({ kind: "error", text: msg });
      logError(e, {
        where: "Profile update",
        userId: id,
        username,
        email,
        avatar,
      });
    } finally {
      setSaving(false);
    }
  }

  // ...existing code...

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
            onChange={(e) => {
              setAvatar(e.target.value);
              if (avatarImgRef.current) {
                avatarImgRef.current.style.display = "";
              }
            }}
            placeholder="https://…"
            autoComplete="photo"
          />
          {avatar && (
            <div style={{ marginTop: 8 }}>
              <span>Preview:</span>
              <br />
              <img
                ref={avatarImgRef}
                src={avatar}
                alt="Avatar preview"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #ccc",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}
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
