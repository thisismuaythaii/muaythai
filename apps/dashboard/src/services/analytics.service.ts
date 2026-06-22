import { API_ENDPOINTS } from "@/lib/api-constants";
import { fetchWithAuth } from "@/lib/api";

export interface AnalyticsOverview {
  total_users: number;
  total_revenue: number;
  total_orders: number;
  total_active_packages: number;
  visits_today: number;
  total_likes: number;
}

export interface RevenuePoint {
  "created_at__date": string;
  daily_revenue: number;
}

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";

export interface OrderStat {
  status: OrderStatus;
  count: number;
}

export interface LocationPerformance {
  name: string;
  order_count: number;
  total_revenue: number | null;
}

export interface UserRoleStat {
  role: string;
  count: number;
}

export interface UserStats {
  by_role: UserRoleStat[];
  new_users_30d: number;
}

export interface VisitorDailyPoint {
  "timestamp__date": string;
  count: number;
}

export interface VisitorTopPath {
  path: string;
  count: number;
}

export interface VisitorStats {
  daily_visits: VisitorDailyPoint[];
  top_paths: VisitorTopPath[];
  total_unique_ips: number;
}

export interface AnalyticsBundle {
  overview: AnalyticsOverview;
  revenue: RevenuePoint[];
  orders: OrderStat[];
  locations: LocationPerformance[];
  users: UserStats;
  visitors: VisitorStats;
}

export const analyticsService = {
  /**
   * High-level platform summary KPIs
   */
  async getOverview(): Promise<AnalyticsOverview> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.ANALYTICS.OVERVIEW}`);
    if (!response.ok) {
      throw new Error("Failed to fetch analytics overview");
    }
    return response.json();
  },

  /**
   * Daily revenue for the last 30 days
   */
  async getRevenue(): Promise<RevenuePoint[]> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.ANALYTICS.REVENUE}`);
    if (!response.ok) {
      throw new Error("Failed to fetch revenue stats");
    }
    return response.json();
  },

  /**
   * Order counts grouped by status
   */
  async getOrderStats(): Promise<OrderStat[]> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.ANALYTICS.ORDERS}`);
    if (!response.ok) {
      throw new Error("Failed to fetch order stats");
    }
    return response.json();
  },

  /**
   * Orders and revenue per location
   */
  async getLocationPerformance(): Promise<LocationPerformance[]> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.ANALYTICS.LOCATIONS}`);
    if (!response.ok) {
      throw new Error("Failed to fetch location performance");
    }
    return response.json();
  },

  /**
   * User growth stats (by role + new users in last 30 days)
   */
  async getUserStats(): Promise<UserStats> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.ANALYTICS.USERS}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user stats");
    }
    return response.json();
  },

  /**
   * Detailed traffic analytics
   */
  async getVisitorStats(): Promise<VisitorStats> {
    const response = await fetchWithAuth(`${API_ENDPOINTS.ANALYTICS.VISITORS}`);
    if (!response.ok) {
      throw new Error("Failed to fetch visitor stats");
    }
    return response.json();
  },

  /**
   * Fetch every analytics dataset in parallel
   */
  async getAll(): Promise<AnalyticsBundle> {
    const [overview, revenue, orders, locations, users, visitors] = await Promise.all([
      this.getOverview(),
      this.getRevenue(),
      this.getOrderStats(),
      this.getLocationPerformance(),
      this.getUserStats(),
      this.getVisitorStats(),
    ]);
    return { overview, revenue, orders, locations, users, visitors };
  },
};
