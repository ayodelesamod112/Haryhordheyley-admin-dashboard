import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuPrinter } from "react-icons/lu";
import { supabase } from "../../supabase/supabaseClient";
import { useAuth } from "../../Context/AuthContext";
import StatusBadge from "../../Components/UI/StatusBadge";
import Loader from "../../Components/UI/Loader";
import EmptyState from "../../Components/UI/EmptyState";
import "../../Styles/CustomerPortal.css";

function MyReceipts() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("payments")
        .select("*, orders(services(name))")
        .eq("placed_by", user.id)
        .eq("status", "success")
        .order("created_at", { ascending: false });
      setReceipts(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const currency = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="portal-page">
      <div className="portal-page-head">
        <span className="eyebrow">Confirmed payments</span>
        <h1>My Receipts</h1>
        <p>Download or print a receipt for any confirmed payment.</p>
      </div>

      {loading ? (
        <Loader label="Loading receipts…" />
      ) : receipts.length === 0 ? (
        <EmptyState title="No receipts yet" message="Receipts appear here once a payment is confirmed by the admin." />
      ) : (
        <div className="table-wrap card">
          <table className="data-table">
            <thead><tr><th>Receipt No.</th><th>Service</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {receipts.map((p) => (
                <tr key={p.id}>
                  <td className="cell-primary">{p.receipt_number || p.id.slice(0, 8).toUpperCase()}</td>
                  <td className="cell-muted">{p.orders?.services?.name || "—"}</td>
                  <td>{currency(p.amount)}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td className="cell-muted">{new Date(p.paid_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/portal/receipts/${p.id}`} className="btn btn-ghost btn-sm">
                      <LuPrinter size={14} /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyReceipts;