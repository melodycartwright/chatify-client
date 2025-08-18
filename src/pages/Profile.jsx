import React from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <section>
      <h1>Profile</h1>
      <p>
        <strong>Username:</strong> {user.username}
      </p>
      {user.userId != null && (
        <p>
          <strong>User ID:</strong> {user.userId}
        </p>
      )}
      {user.avatar && (
        <p>
          <img
            src={user.avatar}
            alt={`${user.username}'s avatar`}
            width="96"
            height="96"
          />
        </p>
      )}
    </section>
  );
}
