const CSRF_KEY = "csrf";
let csrfToken = null;

export function getCsrfToken() {
  if (!csrfToken) {
    csrfToken = sessionStorage.getItem(CSRF_KEY);
    if (!csrfToken) {
      const w = typeof window !== "undefined" ? window : globalThis;
      csrfToken = w?.crypto?.randomUUID
        ? w.crypto.randomUUID()
        : generateFallbackGuid();
      sessionStorage.setItem(CSRF_KEY, csrfToken);
    }
  }
  return csrfToken;
}
export function resertCsrfToken() {
  csrfToken = null;
  sessionStorage.removeItem(CSRF_KEY);
}


function generateFallbackGuid() {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .slice(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}
