import { API_ENDPOINTS } from "@/lib/api-constants";
import { fetchWithAuth } from "@/lib/api";

export interface Review {
  id: number;
  user: number;
  package: number;
  rating: number;
  comment: string;
  user_email: string;
  user_full_name: string;
  created_at: string;
  updated_at: string;
}

export const reviewService = {
  /**
   * Fetch all reviews (admin-only)
   */
  async getReviews(): Promise<Review[]> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.REVIEWS}/`);
    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }
    return response.json();
  },

  /**
   * Delete a review (admin-only)
   *
   * NOTE: Only LIST + DELETE are supported. Editing/updating reviews is
   * intentionally not implemented — PUT/PATCH on the reviews endpoint falls
   * through to AllowAny on the backend, so there is no safe admin edit path.
   */
  async deleteReview(id: number): Promise<void> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.REVIEWS}/${id}/`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete review");
    }
  },
};
