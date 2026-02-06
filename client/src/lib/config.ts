const isProd = import.meta.env.PROD || window.location.hostname !== "localhost";

export const API_BASE_URL = isProd
  ? "https://trackifi-api.trackifi.workers.dev"
  : "http://127.0.0.1:8787";

console.log(`[Config] Running in ${isProd ? "PROD" : "DEV"} mode`);
console.log(`[Config] API Base URL: ${API_BASE_URL}`);
