import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SWIFTAB_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (typeof document !== 'undefined') {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_auth=="))
      ?.split("=")[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof document !== 'undefined') {
        document.cookie = "admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;