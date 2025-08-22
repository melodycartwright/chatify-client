import React from "react";

export default function Banner({ kind = "info", onClose, children }) {
  const className = `banner ${
    kind === "error"
      ? "banner--error"
      : kind === "success"
      ? "banner--success"
      : ""
  }`;
  return (
    <div className={className}>
      <div>{children}</div>
      <button
        className="banner__close"
        type="button"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
