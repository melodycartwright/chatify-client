import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 1.0,
});

export function setUserContext(user) {
  if (!user) {
    Sentry.setUser(null);
    return;
  }
  const id = user.userId ?? user.id;
  Sentry.setUser(
    id
      ? { id: String(id), username: user.username }
      : { username: user.username }
  );
}

export function logError(error, context = {}) {
  Sentry.captureException(error, { extra: context });
  if (import.meta.env.MODE === "development") {
    console.error("Sentry error:", error, context);
  }
}

export function logInfo(message, context = {}) {
  Sentry.captureMessage(message, { extra: context });
  if (import.meta.env.MODE === "development") {
    console.info("Sentry info:", message, context);
  }
}
