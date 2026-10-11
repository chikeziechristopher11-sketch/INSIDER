const localHosts = new Set(["localhost", "127.0.0.1"]);
const isLocalHost = !window.location.hostname || localHosts.has(window.location.hostname);

window.API_BASE_URL = isLocalHost ? "" : "https://insider-gules.vercel.app";
window.apiUrl = (path) => `${window.API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;