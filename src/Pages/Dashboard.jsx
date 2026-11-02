import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuUsers, LuWrench, LuShoppingCart, LuBanknote, LuClock, LuCircleCheck, LuUserPlus, LuPackagePlus } from "react-icons/lu";
import { supabase } from "../supabase/supabaseClient";
import { useAuth } from "../Context/AuthContext";
import StatCard from "../Components/UI/StatCard";
import Loader from "../Components/UI/Loader";
import StatusBadge from "../Components/UI/StatusBadge";
import RevenueTrendChart from "../Components/UI/RevenueTrendChart";
import "../Styles/Dashboard.css";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ customers: 0, services: 0, orders: 0, revenue: 0, pending: 0, completed: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentSignups, setRecentSignups] = useState([]);
  const [trend, setTrend] = useState([]);

  const currency = (n) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

  const loadDashboard = useCallback(async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      { count: customerCount },
      { count: serviceCount },
      { count: orderCount },
      { count: pendingCount },
      { count: completedCount },
      { data: payments },
      { data: orders },
      { data: recentPayments },
      { data: signups },
    ] = await Promise.all([
      supabase.from("customers").select("*", { count: "exact", head: true }),
      supabase.from("services").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("order_status", "pending"),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("order_status", "completed"),
      supabase.from("payments").select("amount").eq("status", "success"),
      supabase
        .from("orders")
        .select("id, amount, order_status, payment_status, order_date, customers(name), services(name)")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase.from("payments").select("amount, paid_at").eq("status", "success").gte("paid_at", sevenDaysAgo.toISOString()),
      supabase.from("profiles").select("id, full_name, created_at").eq("role", "customer").order("created_at", { ascending: false }).limit(6),
    ]);

    const revenue = (payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // Bucket last 7 days of successful payments by day
    const buckets = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.push({ label: DAY_LABELS[d.getDay()], key: d.toDateString(), value: 0 });
    }
    (recentPayments || []).forEach((p) => {
      const key = new Date(p.paid_at).toDateString();
      const bucket = buckets.find((b) => b.key === key);
      if (bucket) bucket.value += Number(p.amount || 0);
    });

    setStats({
      customers: customerCount || 0,
      services: serviceCount || 0,
      orders: orderCount || 0,
      revenue,
      pending: pendingCount || 0,
      completed: completedCount || 0,
    });
    setRecentOrders(orders || []);
    setRecentSignups(signups || []);
    setTrend(buckets);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Live updates: refetch dashboard data whenever orders or payments change anywhere
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-live-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => loadDashboard())
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => loadDashboard())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDashboard]);

  const displayName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  if (loading) {
    return (
      <div className="page">
        <Loader label="Loading your dashboard…" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Overview</span>
          <h1>{getGreeting()}, {displayName} 👋</h1>
          <p className="page-subtitle">Here's what's happening with HARYHORDHEYLEY right now.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={LuUsers} label="Total Customers" value={stats.customers} />
        <StatCard icon={LuWrench} label="Total Services" value={stats.services} />
        <StatCard icon={LuShoppingCart} label="Total Orders" value={stats.orders} />
        <StatCard icon={LuBanknote} label="Total Revenue" value={stats.revenue} formatter={currency} />
        <StatCard icon={LuClock} label="Pending Orders" value={stats.pending} />
        <StatCard icon={LuCircleCheck} label="Completed Orders" value={stats.completed} />
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h2>Revenue — Last 7 Days</h2>
        </div>
        <div className="card-body">
          <RevenueTrendChart data={trend} />
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Recent Activity</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate("/orders")}>
              View all orders
            </button>
          </div>
          <div className="table-wrap">
            {recentOrders.length === 0 ? (
              <div className="empty-state">
                <h4>No orders yet</h4>
                <p>New orders will show up here as soon as they come in.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="cell-primary">{o.customers?.name || "—"}</td>
                      <td className="cell-muted">{o.services?.name || "—"}</td>
                      <td>{currency(o.amount)}</td>
                      <td>
                        <StatusBadge status={o.order_status} />
                      </td>
                      <td className="cell-muted">{o.order_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="card-body quick-actions">
            <button type="button" className="quick-action" onClick={() => navigate("/customers")}>
              <LuUserPlus size={18} />
              <span>Add Customer</span>
            </button>
            <button type="button" className="quick-action" onClick={() => navigate("/services")}>
              <LuPackagePlus size={18} />
              <span>Add Service</span>
            </button>
            <button type="button" className="quick-action" onClick={() => navigate("/orders")}>
              <LuShoppingCart size={18} />
              <span>Create Order</span>
            </button>
            <button type="button" className="quick-action" onClick={() => navigate("/payments")}>
              <LuBanknote size={18} />
              <span>Record Payment</span>
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Recent Signups</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate("/users")}>View all</button>
          </div>
          <div className="card-body">
            {recentSignups.length === 0 ? (
              <p>No customers have signed up yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {recentSignups.map((s) => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{s.full_name || "Unnamed customer"}</span>
                    <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;