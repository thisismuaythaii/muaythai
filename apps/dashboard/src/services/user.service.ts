import { API_ENDPOINTS } from "@/lib/api-constants";
import { fetchWithAuth } from "@/lib/api";

export type UserRole = "USER" | "ADMIN";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO";

/**
 * AdminUserSerializer flattens the nested profile onto the top-level object
 * via `to_representation`, so every profile field appears here directly.
 */
export interface AdminUser {
  id: number;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  // Flattened profile fields
  bio: string | null;
  profile_picture: string | null;
  experience: ExperienceLevel | null;
  weight: string | number | null;
  height: string | number | null;
  medical_conditions: string | null;
  allergies: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  passport: string | null;
  age: number | null;
  gender: Gender | null;
  phone: string | null;
}

/**
 * Editable fields via PATCH /users/{id}/.
 * `email`, `role`, `created_at` are read-only on the serializer (role has a
 * dedicated endpoint). Profile fields are sent flat and re-nested server-side.
 */
export interface UpdateUserInput {
  full_name?: string | null;
  is_active?: boolean;
  phone?: string | null;
  age?: number | null;
  gender?: Gender | null;
  experience?: ExperienceLevel | null;
  weight?: string | number | null;
  height?: string | number | null;
  bio?: string | null;
  medical_conditions?: string | null;
  allergies?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  passport?: string | null;
}

export const userService = {
  /**
   * Fetch all users (admin)
   */
  async getUsers(): Promise<AdminUser[]> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.USERS}/`);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    return response.json();
  },

  /**
   * Retrieve a single user (admin)
   */
  async getUser(id: number): Promise<AdminUser> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.USERS}/${id}/`);
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }
    return response.json();
  },

  /**
   * Update a user — full_name, is_active and flat profile fields. PATCH only.
   */
  async updateUser(id: number, data: UpdateUserInput): Promise<AdminUser> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.USERS}/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || "Failed to update user");
    }

    return response.json();
  },

  /**
   * Change a user's role via the dedicated endpoint
   */
  async updateUserRole(id: number, role: UserRole): Promise<AdminUser> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.USERS}/${id}/role/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || "Failed to update role");
    }

    return response.json();
  },

  /**
   * Soft-delete a user (sets is_active=False server-side)
   */
  async deleteUser(id: number): Promise<void> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.USERS}/${id}/`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }
  },
};
