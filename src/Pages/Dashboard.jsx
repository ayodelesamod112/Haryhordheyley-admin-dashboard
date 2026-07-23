import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuUsers, LuWrench, LuShoppingCart, LuBanknote, LuClock, LuCircleCheck, LuUserPlus, LuPackagePlus } from "react-icons/lu";
import { supabase } from "../supabase/supabaseClient";
import StatCard from "../Components/UI/StatCard";
import Loader from "../Components/UI/Loader";
import StatusBadge from "../Components/UI/StatusBadge";
import "../Styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    customers: 0,
    services: 0,
    orders: 0,
    revenue: 0,
    pending: 0,
    completed: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);

      const [
        { count: customerCount },
        { count: serviceCount },
        { count: orderCount },
        { count: pendingCount },
        { count: completedCount },
        { data: payments },
        { data: orders },
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
      ]);

      const revenue = (payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);

      setStats({
        customers: customerCount || 0,
        services: serviceCount || 0,
        orders: orderCount || 0,
        revenue,
        pending: pendingCount || 0,
        completed: completedCount || 0,
      });
      setRecentOrders(orders || []);
      setLoading(false);
    };

    loadDashboard();
  }, []);

  const currency = (n) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

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
          <h1>Dashboard</h1>
          <p className="page-subtitle">A snapshot of HARYHORDHEYLEY's business right now.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={LuUsers} label="Total Customers" value={stats.customers} />
        <StatCard icon={LuWrench} label="Total Services" value={stats.services} />
        <StatCard icon={LuShoppingCart} label="Total Orders" value={stats.orders} />
        <StatCard icon={LuBanknote} label="Total Revenue" value={currency(stats.revenue)} />
        <StatCard icon={LuClock} label="Pending Orders" value={stats.pending} />
        <StatCard icon={LuCircleCheck} label="Completed Orders" value={stats.completed} />
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
      </div>
    </div>
  );
}

export default Dashboard;
