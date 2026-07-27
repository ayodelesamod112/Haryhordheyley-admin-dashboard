import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuShoppingBag, LuClock, LuCircleCheck, LuCreditCard, LuWrench, LuMessageSquare } from "react-icons/lu";
import { supabase } from "../../supabase/supabaseClient";
import { useAuth } from "../../Context/AuthContext";
import StatCard from "../../Components/UI/StatCard";
import Loader from "../../Components/UI/Loader";
import "../../Styles/CustomerPortal.css";

function CustomerDashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, completed: 0, pendingPayments: 0, receipts: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [{ data: orders }, { data: payments }] = await Promise.all([
        supabase.from("orders").select("*, services(name)").eq("placed_by", user.id).order("created_at", { ascending: false }),
        supabase.from("payments").select("*").eq("placed_by", user.id),
      ]);

      const activeOrders = (orders || []).filter((o) => ["pending", "processing"].includes(o.order_status || o.status));
      const completedOrders = (orders || []).filter((o) => (o.order_status || o.status) === "completed");
      const pendingPayments = (payments || []).filter((p) => p.status === "pending").length;
      const receipts = (payments || []).filter((p) => p.status === "success").length;

      setStats({ active: activeOrders.length, completed: completedOrders.length, pendingPayments, receipts });
      setRecentOrders((orders || []).slice(0, 5));
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="portal-page"><Loader label="Loading your dashboard…" /></div>;

  return (
    <div className="portal-page">
      <div className="dash-welcome">
        <h2>Welcome back, {profile?.full_name || "there"} 👋</h2>
        <p>Here's a quick look at your orders, payments, and receipts.</p>
        <div className="dash-quick-actions">
          <Link to="/portal/services" className="btn btn-primary"><LuWrench size={15} /> Order a Service</Link>
          <Link to="/portal/payments" className="btn btn-ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.25)" }}><LuCreditCard size={15} /> Upload Payment</Link>
          <Link to="/portal/messages" className="btn btn-ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.25)" }}><LuMessageSquare size={15} /> Message Us</Link>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={LuShoppingBag} label="Active Orders" value={stats.active} />
        <StatCard icon={LuCircleCheck} label="Completed Orders" value={stats.completed} />
        <StatCard icon={LuClock} label="Pending Payments" value={stats.pendingPayments} />
        <StatCard icon={LuCreditCard} label="Receipts" value={stats.receipts} />
      </div>

      <div className="card">
        <div className="card-header"><h2>Recent Orders</h2><Link to="/portal/orders" className="btn btn-ghost btn-sm">View all</Link></div>
        {recentOrders.length === 0 ? (
          <div className="card-body"><p>No orders yet — head to Services to place your first order.</p></div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Service</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="cell-primary">{o.services?.name || "—"}</td>
                    <td>{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(o.amount || 0)}</td>
                    <td style={{ textTransform: "capitalize" }}>{o.order_status || o.status}</td>
                    <td className="cell-muted">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerDashboard;