import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LuPrinter, LuArrowLeft } from "react-icons/lu";
import { supabase } from "../../supabase/supabaseClient";
import { useAuth } from "../../Context/AuthContext";
import Loader from "../../Components/UI/Loader";
import logo from "../../assets/logo.png";
import "../../Styles/Receipt.css";

function CustomerReceipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [payment, setPayment] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: paymentData, error: paymentError }, { data: businessData }] = await Promise.all([
        supabase.from("payments").select("*, orders(services(name, description))").eq("id", id).single(),
        supabase.from("business_settings").select("*").eq("id", 1).single(),
      ]);

      if (paymentError) setError(paymentError.message);
      else setPayment(paymentData);
      setBusiness(businessData);
      setLoading(false);
    };
    load();
  }, [id]);

  const currency = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

  if (loading) return <div className="receipt-shell"><Loader label="Loading receipt…" /></div>;

  if (error || !payment) {
    return (
      <div className="receipt-shell">
        <p>Couldn't load this receipt{error ? `: ${error}` : "."}</p>
        <button type="button" className="btn btn-ghost" onClick={() => navigate("/portal/receipts")}>
          <LuArrowLeft size={16} /> Back to Receipts
        </button>
      </div>
    );
  }

  const receiptNumber = payment.receipt_number || payment.id.slice(0, 8).toUpperCase();

  return (
    <div className="receipt-shell">
      <div className="receipt-toolbar no-print">
        <button type="button" className="btn btn-ghost" onClick={() => navigate("/portal/receipts")}>
          <LuArrowLeft size={16} /> Back
        </button>
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          <LuPrinter size={16} /> Print Receipt
        </button>
      </div>

      <div className="receipt-paper">
        <div className="receipt-header">
          <div className="receipt-brand">
            <img src={logo} alt="" className="receipt-logo" />
            <div>
              <h2>{business?.business_name || "HARYHORDHEYLEY Smart Tech Digital Service"}</h2>
              {business?.address && <p>{business.address}</p>}
              {business?.phone && <p>{business.phone}</p>}
            </div>
          </div>
          <div className="receipt-meta">
            <h3>RECEIPT</h3>
            <p>№ {receiptNumber}</p>
            <p>{new Date(payment.paid_at || payment.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="receipt-divider" />

        <div className="receipt-parties">
          <div>
            <span className="receipt-label">Billed to</span>
            <p className="receipt-strong">{profile?.full_name || "—"}</p>
            {profile?.phone && <p>{profile.phone}</p>}
          </div>
          <div>
            <span className="receipt-label">Payment method</span>
            <p className="receipt-strong" style={{ textTransform: "capitalize" }}>{String(payment.method).replace("_", " ")}</p>
            <span className="receipt-label" style={{ marginTop: 10, display: "block" }}>Payment status</span>
            <p className="receipt-strong" style={{ textTransform: "capitalize" }}>{payment.status}</p>
          </div>
        </div>

        <table className="receipt-table">
          <thead>
            <tr>
              <th>Service</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <p className="receipt-strong">{payment.orders?.services?.name || "Service"}</p>
                {payment.orders?.services?.description && <p className="receipt-item-desc">{payment.orders.services.description}</p>}
              </td>
              <td style={{ textAlign: "right" }}>{currency(payment.amount)}</td>
            </tr>
          </tbody>
        </table>

        <div className="receipt-total-row">
          <span>Total</span>
          <span>{currency(payment.amount)}</span>
        </div>

        <div className="receipt-divider" />

        <p className="receipt-footer-note">
          Thank you for choosing {business?.business_name || "HARYHORDHEYLEY Smart Tech Digital Service"}.
        </p>
      </div>
    </div>
  );
}

export default CustomerReceipt;