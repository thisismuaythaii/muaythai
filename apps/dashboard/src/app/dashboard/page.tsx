"use client";

import {
  Users,
  CreditCard,
  Calendar,
  ShoppingBag,
  ShieldCheck,
  ArrowUpRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
  PieChart, Pie
} from "recharts";
import { useEffect, useState, useCallback } from "react";
import { analyticsService, AnalyticsBundle } from "@/services/analytics.service";
import { useAuth } from "@/context/AuthContext";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "hsl(45 100% 50%)",
  PAID: "hsl(210 100% 50%)",
  COMPLETED: "hsl(140 70% 45%)",
  CANCELLED: "hsl(0 80% 55%)",
};

const formatINR = (value: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatShortDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

export default function DashboardHub() {
  const { user } = useAuth();
  const adminName =
    user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Admin";
  const [data, setData] = useState<AnalyticsBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const bundle = await analyticsService.getAll();
      setData(bundle);
      setError(null);
    } catch (err) {
      setError("Failed to load analytics. Please check your connection.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <div className="p-10 min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="animate-spin text-primary w-12 h-12" />
          <div className="absolute inset-0 blur-lg bg-primary/20 animate-pulse" />
        </div>
        <span className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
          Loading Intelligence...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-10 min-h-screen bg-black flex items-center justify-center">
        <div className="glass-surface p-12 rounded-[3rem] border border-red-500/20 flex flex-col items-center text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
            <AlertCircle className="text-red-500 w-8 h-8" />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">{error || "No data available"}</h3>
          <p className="text-white/40 text-sm max-w-xs mb-6">
            There was a problem syncing with the analytics service.
          </p>
          <button
            onClick={fetchAnalytics}
            className="bg-white text-black px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { overview, revenue, orders, locations, users } = data;

  const totalOrderCount = orders.reduce((sum, o) => sum + o.count, 0);
  const ordersByStatus = orders.map((o) => ({
    name: o.status,
    value: o.count,
    color: STATUS_COLORS[o.status] || "hsl(16 100% 50%)",
  }));

  const revenueData = revenue.map((r) => ({
    name: formatShortDate(r["created_at__date"]),
    total: Number(r.daily_revenue || 0),
  }));

  const locationData = locations.map((l) => ({
    name: l.name,
    count: l.order_count,
  }));

  return (
    <div className="p-10 space-y-10">
      {/* Page Header */}
      <div className="flex items-end justify-between border-b border-white/5 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter">
            <span className="text-white/40">Hi, </span>
            <span className="text-white">{adminName}</span>
          </h1>
          <p className="text-white/40 font-semibold text-xs tracking-[0.2em] uppercase">
            Intelligence & Operational Metrics
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={Number(overview.total_users).toLocaleString("en-IN")}
          subValue={`+${users.new_users_30d} in last 30 days`}
          icon={Users}
          trend="up"
          trendValue={`+${users.new_users_30d}`}
          chartColor="primary"
        />
        <StatCard
          title="Total Revenue"
          value={formatINR(overview.total_revenue)}
          subValue={`${overview.total_likes.toLocaleString("en-IN")} total likes`}
          icon={CreditCard}
          trend="up"
          trendValue="INR"
          chartColor="secondary"
        />
        <StatCard
          title="Active Camps"
          value={Number(overview.total_active_packages).toLocaleString("en-IN")}
          subValue={`Across ${locations.length} locations`}
          icon={Calendar}
          trend="up"
          trendValue={`${locations.length} hubs`}
          chartColor="accent"
        />
        <StatCard
          title="Total Bookings"
          value={Number(overview.total_orders).toLocaleString("en-IN")}
          subValue={`${overview.visits_today.toLocaleString("en-IN")} visits today`}
          icon={ShoppingBag}
          trend="up"
          trendValue={`${overview.visits_today} today`}
          chartColor="primary"
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 glass-surface p-8 rounded-[2.5rem] border border-white/5 relative group">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white tracking-tight">Revenue Stream</h3>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">
                Daily Revenue · Last 30 Days
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="h-[350px] w-full">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(16 100% 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(16 100% 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }}
                    itemStyle={{ color: "hsl(16 100% 50%)" }}
                    formatter={(value: number) => [formatINR(value), "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(16 100% 50%)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">
                  No revenue recorded yet
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bookings by Status (Pie Chart) */}
        <div className="glass-surface p-8 rounded-[2.5rem] border border-white/5 flex flex-col">
          <div className="space-y-1 mb-8">
            <h3 className="text-xl font-bold text-white tracking-tight">Bookings by Status</h3>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">
              {totalOrderCount.toLocaleString("en-IN")} total bookings
            </p>
          </div>

          <div className="h-[250px] w-full flex-1">
            {ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">
                  No bookings yet
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            {ordersByStatus.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-white/60 tracking-wider uppercase">{item.name}</span>
                </div>
                <span className="text-xs font-black text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Area: Location Performance */}
      <div className="glass-surface p-8 rounded-[2.5rem] border border-white/5">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white tracking-tight">Location Performance</h3>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">
              Booking counts by region
            </p>
          </div>
          <ShieldCheck className="text-white/10 w-8 h-8" />
        </div>

        <div className="h-[300px] w-full">
          {locationData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.2)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.2)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  formatter={(value: number) => [value, "Bookings"]}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {locationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(16 100% 50%)" : "hsl(210 100% 50%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <span className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">
                No location data yet
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
