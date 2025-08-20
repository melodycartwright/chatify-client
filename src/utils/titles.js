
const KEY = "conversation_titles";

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}
function write(map) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function getTitle(conversationId) {
  const map = read();
  return map[conversationId] || null;
}
export function setTitle(conversationId, title) {
  const map = read();
  if (!title) delete map[conversationId];
  else map[conversationId] = title;
  write(map);
}
export function getAllTitles() {
  return read();
}
