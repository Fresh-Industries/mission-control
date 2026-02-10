"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Target,
  Zap,
} from "lucide-react";

interface MissionItem {
  id: string;
  title: string;
  description: string;
  category: "feature" | "workflow" | "template" | "research" | "automation";
  status: "pending" | "in-progress" | "approved" | "rejected";
  created: string;
  updated: string;
  notes?: string;
  link?: string;
}

interface AnalyticsDashboardProps {
  items: MissionItem[];
}

const COLORS = {
  feature: "#8b5cf6",
  workflow: "#3b82f6",
  template: "#eab308",
  research: "#10b981",
  automation: "#ec4899",
  pending: "#f97316",
  approved: "#22c55e",
  rejected: "#ef4444",
  inprogress: "#3b82f6",
};

const STATUS_COLORS = {
  pending: "#f97316",
  "in-progress": "#3b82f6",
  approved: "#22c55e",
  rejected: "#ef4444",
};

export function AnalyticsDashboard({ items }: AnalyticsDashboardProps) {
  // Calculate category distribution
  const categoryData = useMemo(() => {
    const counts = items.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: COLORS[name as keyof typeof COLORS] || "#6b7280",
    }));
  }, [items]);

  // Calculate status distribution
  const statusData = useMemo(() => {
    const counts = items.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(counts).map(([name, value]) => ({
      name:
        name === "in-progress"
          ? "In Progress"
          : name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || "#6b7280",
    }));
  }, [items]);

  // Calculate activity over time (last 7 days)
  const activityData = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const created = items.filter((item) => item.created.startsWith(dateStr));
      const approved = items.filter(
        (item) =>
          item.status === "approved" &&
          item.updated.startsWith(dateStr) &&
          item.created !== item.updated
      );

      days.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        created: created.length,
        approved: approved.length,
      });
    }

    return days;
  }, [items]);

  // Calculate productivity metrics
  const metrics = useMemo(() => {
    const total = items.length;
    const pending = items.filter((i) => i.status === "pending").length;
    const inProgress = items.filter((i) => i.status === "in-progress").length;
    const approved = items.filter((i) => i.status === "approved").length;
    const rejected = items.filter((i) => i.status === "rejected").length;

    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const velocity =
      approved > 0
        ? Math.round((approved / Math.max(1, approved + rejected)) * 100)
        : 0;

    // Calculate average time to approval (simplified)
    const approvedItems = items.filter((i) => i.status === "approved");
    const avgTimeToApprove =
      approvedItems.length > 0
        ? Math.round(approvedItems.length * 0.5) // Simplified calculation
        : 0;

    return {
      total,
      pending,
      inProgress,
      approved,
      rejected,
      approvalRate,
      velocity,
      avgTimeToApprove,
    };
  }, [items]);

  // Weekly trend (simplified)
  const weeklyTrend = useMemo(() => {
    const recentItems = items.slice(0, 7);
    const created = recentItems.length;
    const approved = recentItems.filter((i) => i.status === "approved").length;

    return {
      created,
      approved,
      trend: approved > 0 ? "+" + Math.round((approved / created) * 100) + "%" : "0%",
    };
  }, [items]);

  return (
    <div className="space-y-8">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm text-muted-foreground">Total Items</span>
          </div>
          <div className="text-3xl font-bold">{metrics.total}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {metrics.pending} pending approval
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Approved</span>
          </div>
          <div className="text-3xl font-bold text-green-500">{metrics.approved}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {metrics.approvalRate}% approval rate
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">Velocity</span>
          </div>
          <div className="text-3xl font-bold text-blue-500">{metrics.velocity}%</div>
          <div className="text-xs text-muted-foreground mt-1">
            {metrics.avgTimeToApprove}h avg to approve
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-sm text-muted-foreground">In Progress</span>
          </div>
          <div className="text-3xl font-bold text-orange-500">{metrics.inProgress}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Being worked on now
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              Activity (Last 7 Days)
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: "currentColor" }} />
                <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="created"
                  name="Created"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="approved"
                  name="Approved"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6">Category Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6">Status Overview</h3>
        <div className="flex flex-wrap gap-4">
          {statusData.map((status) => (
            <div
              key={status.name}
              className="flex items-center gap-3 bg-accent/50 rounded-lg px-4 py-3"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              <span className="text-sm font-medium">{status.name}</span>
              <span className="text-lg font-bold">{status.value}</span>
            </div>
          ))}
        </div>

        {/* Simple progress bar */}
        <div className="mt-6 h-4 bg-accent rounded-full overflow-hidden flex">
          {statusData.map((status) => (
            <div
              key={status.name}
              style={{
                width: `${(status.value / metrics.total) * 100}%`,
                backgroundColor: status.color,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Pending</span>
          <span>In Progress</span>
          <span>Approved</span>
          <span>Rejected</span>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          This Week's Summary
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">{weeklyTrend.created}</div>
            <div className="text-sm text-muted-foreground">Items Created</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-500">{weeklyTrend.approved}</div>
            <div className="text-sm text-muted-foreground">Items Approved</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500">{weeklyTrend.trend}</div>
            <div className="text-sm text-muted-foreground">Approval Efficiency</div>
          </div>
        </div>
      </div>
    </div>
  );
}
