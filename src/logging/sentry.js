
import * as Sentry from "@sentry/react";

let initialized = false;

function enabledDsn() {
  const raw = (import.meta.env?.VITE_SENTRY_DSN || "").trim();
  if (!raw) return null;
  const placeholders = new Set([
    "YOUR_SENTRY_DSN",
    "___REPLACE_ME___",
    "your_dsn_here",
  ]);
  if (placeholders.has(raw)) return null; 
  return raw;
}

export function initLogging(user) {
  const dsn = enabledDsn();
  if (!dsn) {
    if (import.meta.env.DEV)
      console.warn("Sentry disabled (no VITE_SENTRY_DSN set).");
    return;
  }

  try {
    Sentry.init({
      dsn,
      tracesSampleRate: 1.0,
    });
    initialized = true;
    setUserContext(user);
  } catch (e) {
    initialized = false;
    console.warn("Sentry disabled (bad DSN):", e?.message || e);
  }
}

export function setUserContext(user) {
  if (!initialized) return; 
  if (!user) {
    Sentry.setUser(null);
    return;
  }
  const id =
    user.userId != null
      ? String(user.userId)
      : user.id != null
      ? String(user.id)
      : undefined;
  Sentry.setUser(
    id ? { id, username: user.username } : { username: user.username }
  );
}

export function logError(err, ctx) {
  if (!initialized) {
    console.error("[logError]", err, ctx);
    return;
  }
  Sentry.captureException(err, { extra: ctx });
}

export function logInfo(msg, ctx) {
  if (!initialized) {
    console.info("[logInfo]", msg, ctx);
    return;
  }
  Sentry.captureMessage(msg, { level: "info", extra: ctx });
}
