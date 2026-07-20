import apiClient from "@/lib/axios";

export async function fetchAllReservation() {
  try {
    const response = await apiClient.get("/admin/reservations");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Error fetching data");
  }
}
