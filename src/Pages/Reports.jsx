import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import Loader from "../Components/UI/Loader";
import StatCard from "../Components/UI/StatCard";
import { LuBanknote, LuShoppingCart, LuTrendingUp } from "react-icons/lu";
import "../Styles/Reports.css";

const STATUS_ORDER = ["pending", "processing", "completed", "cancelled"];

function Reports() {
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState({});
  const [revenueByMethod, setRevenueByMethod] = useState({});
  const [totals, setTotals] = useState({ revenue: 0, orders: 0, avgOrder: 0 });

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      const [{ data: orders }, { data: payments }] = await Promise.all([
        supabase.from("orders").select("order_status, amount"),
        supabase.from("payments").select("method, amount").eq("status", "success"),
      ]);

      const counts = {};
      (orders || []).forEach((o) => { counts[o.order_status] = (counts[o.order_status] || 0) + 1; });
      setStatusCounts(counts);

      const byMethod = {};
      let revenue = 0;
      (payments || []).forEach((p) => {
        byMethod[p.method] = (byMethod[p.method] || 0) + Number(p.amount || 0);
        revenue += Number(p.amount || 0);
      });
      setRevenueByMethod(byMethod);

      const orderCount = (orders || []).length;
      setTotals({
        revenue,
        orders: orderCount,
        avgOrder: orderCount ? revenue / orderCount : 0,
      });

      setLoading(false);
    };
    loadReports();
  }, []);

  const currency = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);
  const maxStatus = Math.max(1, ...Object.values(statusCounts));
  const maxMethod = Math.max(1, ...Object.values(revenueByMethod));

  if (loading) {
    return (
      <div className="page">
        <Loader label="Crunching your numbers…" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Reports</span>
          <h1>Business Reports</h1>
          <p className="page-subtitle">Orders and revenue at a glance.</p>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={LuBanknote} label="Total Revenue" value={currency(totals.revenue)} />
        <StatCard icon={LuShoppingCart} label="Total Orders" value={totals.orders} />
        <StatCard icon={LuTrendingUp} label="Average Order Value" value={currency(totals.avgOrder)} />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><h2>Orders by Status</h2></div>
          <div className="card-body">
            {STATUS_ORDER.filter((s) => statusCounts[s]).length === 0 ? (
              <p>No order data yet.</p>
            ) : (
              STATUS_ORDER.map((status) => statusCounts[status] ? (
                <div className="bar-row" key={status}>
                  <span className="bar-label">{status}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(statusCounts[status] / maxStatus) * 100}%` }} />
                  </div>
                  <span className="bar-value">{statusCounts[status]}</span>
                </div>
              ) : null)
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>Revenue by Method</h2></div>
          <div className="card-body">
            {Object.keys(revenueByMethod).length === 0 ? (
              <p>No successful payments yet.</p>
            ) : (
              Object.entries(revenueByMethod).map(([method, amount]) => (
                <div className="bar-row" key={method}>
                  <span className="bar-label">{method.replace("_", " ")}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(amount / maxMethod) * 100}%` }} />
                  </div>
                  <span className="bar-value">{currency(amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
