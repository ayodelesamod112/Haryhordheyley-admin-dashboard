import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuShoppingBag, LuClock, LuCircleCheck, LuCreditCard, LuWrench, LuMessageSquare } from "react-icons/lu";
import { supabase } from "../../supabase/supabaseClient";
import { useAuth } from "../../Context/AuthContext";
import StatCard from "../../Components/UI/StatCard";
import Loader from "../../Components/UI/Loader";
import "../../Styles/Dashboard.css";
import "../../Styles/CustomerPortal.css";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function CustomerDashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, completed: 0, pendingPayments: 0, receipts: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const [{ data: orders }, { data: payments }] = await Promise.all([
        supabase.from("orders").select("*, services(name)").eq("placed_by", user.id).order("created_at", { ascending: false }),
        supabase.from("payments").select("*").eq("placed_by", user.id),
      ]);

      if (!mounted) return;
      const orderRows = orders || [];
      const paymentRows = payments || [];
      const activeOrders = orderRows.filter((order) => ["pending", "processing"].includes(order.order_status || order.status));
      const completedOrders = orderRows.filter((order) => (order.order_status || order.status) === "completed");

      setStats({
        active: activeOrders.length,
        completed: completedOrders.length,
        pendingPayments: paymentRows.filter((payment) => payment.status === "pending").length,
        receipts: paymentRows.filter((payment) => payment.status === "success").length,
      });
      setRecentOrders(orderRows.slice(0, 5));
      setLoading(false);
    };

    load();
    return () => { mounted = false; };
  }, [user]);

  if (loading) return <div className="portal-page"><Loader label="Loading your dashboard..." /></div>;

  return (
    <div className="portal-page">
      <div className="dash-welcome">
        <h2>Welcome back, {profile?.full_name || "there"} 👋</h2>
        <p>Here&apos;s a quick look at your orders, payments, and receipts.</p>
        <div className="dash-quick-actions">
          <Link to="/portal/services" className="btn btn-primary"><LuWrench size={15} /> Order a Service</Link>
          <Link to="/portal/payments" className="btn btn-ghost dash-action-light"><LuCreditCard size={15} /> Upload Payment</Link>
          <Link to="/portal/messages" className="btn btn-ghost dash-action-light"><LuMessageSquare size={15} /> Message Us</Link>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={LuShoppingBag} label="Active Orders" value={stats.active} />
        <StatCard icon={LuCircleCheck} label="Completed Orders" value={stats.completed} />
        <StatCard icon={LuClock} label="Pending Payments" value={stats.pendingPayments} />
        <StatCard icon={LuCreditCard} label="Receipts" value={stats.receipts} />
      </div>

      <section className="card" aria-labelledby="recent-orders-heading">
        <div className="card-header">
          <h2 id="recent-orders-heading">Recent Orders</h2>
          <Link to="/portal/orders" className="btn btn-ghost btn-sm">View all</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="card-body"><p>No orders yet. Visit Services to place your first order.</p></div>
        ) : (
          <div className="recent-order-list">
            {recentOrders.map((order) => {
              const status = order.order_status || order.status || "pending";
              const statusClass = status.toLowerCase().replaceAll("_", "-");
              return (
                <article className="recent-order-card" key={order.id}>
                  <div className="recent-order-heading">
                    <div>
                      <span className="recent-order-label">Service</span>
                      <h3>{order.services?.name || "Service order"}</h3>
                    </div>
                    <span className={`recent-order-status status-${statusClass}`}>
                      {status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="recent-order-details">
                    <div>
                      <span className="recent-order-label">Amount</span>
                      <strong>{currency.format(order.amount || 0)}</strong>
                    </div>
                    <div>
                      <span className="recent-order-label">Order date</span>
                      <strong>{new Date(order.created_at).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default CustomerDashboard;
