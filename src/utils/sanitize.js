import DOMPurify from "dompurify";

// sanitize any user HTML before rendering
export function sanitize(html) {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
