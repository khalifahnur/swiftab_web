import apiClient from "@/lib/axios";

export async function fetchMenu() {
  const response = await apiClient.get('/restaurants/menu');
  return response.data;
}

