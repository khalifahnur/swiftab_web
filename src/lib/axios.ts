import axios, { AxiosError } from "axios";

/**
 * The dashboard authenticates with an HTTP-only session cookie set by the API,
 * so requests only need to be sent with credentials.
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SWIFTAB_BASE_URL,
  headers: { Accept: "application/json" },
  withCredentials: true,
});

/** Base URL of the API, for things axios does not handle (the live event stream). */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_SWIFTAB_BASE_URL ?? "").replace(/\/$/, "");

/**
 * Turns any failed request into a message a person can act on. The API puts
 * its explanation under both `error` and `message`.
 */
export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(error)) {
    const data = (error as AxiosError<{ error?: string; message?: string }>).response?.data;
    if (data && typeof data === "object") {
      return data.error || data.message || fallback;
    }
    if (!error.response) {
      return "We couldn't reach the server. Check your connection and try again.";
    }
    return fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** True when the API says the session is missing or expired. */
export function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export default apiClient;
