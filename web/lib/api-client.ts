import axios from "axios";

/**
 * Resolves the portfolio chat API origin (no trailing slash).
 */
export function getChatApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_CHAT_API_URL?.trim();
  if (base) return base.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5063";
    }
  }

  throw new Error("NEXT_PUBLIC_CHAT_API_URL is not set.");
}

/**
 * Shared Axios instance for all backend calls.
 */
export const apiClient = axios.create({
  adapter: "fetch",
  timeout: 0,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getChatApiBaseUrl();
  return config;
});
