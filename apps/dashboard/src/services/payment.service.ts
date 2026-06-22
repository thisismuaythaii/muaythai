import { API_ENDPOINTS } from "@/lib/api-constants";
import { fetchWithAuth } from "@/lib/api";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface Payment {
  id: number;
  order: number;
  razorpay_payment_id: string | null;
  razorpay_order_id: string;
  razorpay_signature: string | null;
  amount: string;
  status: PaymentStatus;
  method: string | null;
  created_at: string;
  updated_at: string;
}

export const paymentService = {
  /**
   * Fetch all payments (admin, read-only)
   */
  async getPayments(): Promise<Payment[]> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.PAYMENTS}/`);
    if (!response.ok) {
      throw new Error("Failed to fetch payments");
    }
    return response.json();
  },

  /**
   * Retrieve a single payment by id
   */
  async getPayment(id: number): Promise<Payment> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.PAYMENTS}/${id}/`);
    if (!response.ok) {
      throw new Error("Failed to fetch payment");
    }
    return response.json();
  },
};
