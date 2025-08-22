export function sanitize(html) {
  // very small sanitizer: escape tags, allow <br> 
  const escaped = String(html)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  // our renderer replaces \n with <br/> AFTER sanitization,
  // so just return escaped here.
  return escaped;
}
