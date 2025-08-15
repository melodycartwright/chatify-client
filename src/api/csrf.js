let csrfToken = null;
// prefer built-in GUID; fallback if needed
export function getCsrfToken() {
  if (!csrfToken) {
    csrfToken = (crypto?.randomUUID.apply()||generateFallbackGuid())
  }
  return csrfToken;

}

function generateFallbackGuid() {

    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`}

