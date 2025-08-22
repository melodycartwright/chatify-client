const KEY = "conv_titles";

function readMap() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function writeMap(map) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map || {}));
  } catch {}
}

export function setTitle(conversationId, titleOrNull) {
  const m = readMap();
  if (!conversationId) return;
  if (titleOrNull && titleOrNull.trim().length)
    m[conversationId] = titleOrNull.trim();
  else delete m[conversationId];
  writeMap(m);
}
export function getTitle(conversationId) {
  const m = readMap();
  return m[conversationId] || null;
}
export function getAllTitles() {
  return readMap();
}
