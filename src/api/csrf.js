let csrfToken = null;

export function getCsrfToken() {
  if (!csrfToken) {
    const w = typeof window !== "undefined" ? window : globalThis;
    if (w?.crypto && typeof w.crypto.randomUUID === "function") {
      csrfToken = w.crypto.randomUUID();
    } else {
      csrfToken = generateFallbackGuid();
    }
  }
  return csrfToken;
}

function generateFallbackGuid() {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .slice(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}
