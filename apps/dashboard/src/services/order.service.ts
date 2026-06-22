import { API_ENDPOINTS } from "@/lib/api-constants";
import { fetchWithAuth } from "@/lib/api";

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";

export interface OrderPackageDetails {
  id: number;
  name: string;
  type: string;
  description: string;
  price: number | string;
  start_date: string | null;
  duration_days: number | null;
  location: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  package: number;
  package_name: string;
  package_details: OrderPackageDetails;
  user: number;
  user_email: string;
  total_amount: number | string;
  start_date: string | null;
  status: OrderStatus;
  razorpay_order_id: string | null;
  created_at: string;
  updated_at: string;
}

export const orderService = {
  /**
   * Fetch all orders (admin)
   */
  async getOrders(): Promise<Order[]> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.ORDERS}/`);
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }
    return response.json();
  },

  /**
   * Update an order's status (admin action)
   */
  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.ORDERS}/${id}/status/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || "Failed to update order status");
    }

    return response.json();
  },

  /**
   * Delete an order (admin)
   */
  async deleteOrder(id: number): Promise<void> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.ORDERS}/${id}/`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete order");
    }
  },
};
