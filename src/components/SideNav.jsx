import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function SideNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const avatarUrl =
    (user?.avatar && String(user.avatar).trim()) ||
    (user?.username
      ? `https://i.pravatar.cc/150?u=${encodeURIComponent(user.username)}`
      : "");

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="sidenav">
      <div
        style={{
          marginBottom: 12,
          fontSize: 14,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isAuthenticated && avatarUrl ? (
            <img
              src={avatarUrl}
              width="40"
              height="40"
              style={{ borderRadius: 999 }}
              alt={`${user?.username || "user"} avatar`}
            />
          ) : null}
          {isAuthenticated && user ? (
            <>
              Signed in as <strong>{user.username}</strong>
            </>
          ) : (
            "Not signed in"
          )}
        </div>

        {isAuthenticated && user?.userId ? (
          <div style={{ fontSize: 12, color: "#cfc8d4" }}>
            Your ID: <code title="userId">{user.userId}</code>
            <button
              type="button"
              className="btn btn--xs btn--outline"
              style={{ marginLeft: 6, padding: "2px 6px" }}
              onClick={() =>
                navigator.clipboard?.writeText(String(user.userId))
              }
              aria-label="Copy your user ID"
            >
              Copy
            </button>
          </div>
        ) : null}
      </div>

      <nav>
        <ul>
        <li>
            <NavLink className="nav-item" to="/profile">
              Profile
            </NavLink>
          </li>   
          <li>
            <NavLink className="nav-item" to="/chat">
              Chat
            </NavLink>
          </li>
         
          <li>
            <button className="nav-item" type="button" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
