import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function SideNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
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
          alignItems: "center",
          gap: 8,
        }}
      >
        {isAuthenticated && user?.avatar ? (
          <img
            src={user.avatar}
            width="24"
            height="24"
            style={{ borderRadius: 6 }}
            alt=""
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
      <nav>
        <ul>
          <li>
            <NavLink to="/chat">Chat</NavLink>
          </li>
          <li>
            <NavLink to="/profile">Profile</NavLink>
          </li>
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
