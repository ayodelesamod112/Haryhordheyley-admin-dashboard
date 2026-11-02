import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LuPrinter, LuArrowLeft } from "react-icons/lu";
import { supabase } from "../supabase/supabaseClient";
import Loader from "../Components/UI/Loader";
import logo from "../assets/logo.png";
import "../Styles/Receipt.css";

function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: orderData, error: orderError }, { data: businessData }] = await Promise.all([
        supabase
          .from("orders")
          .select("*, customers(name, phone, email, address), services(name, description)")
          .eq("id", id)
          .single(),
        supabase.from("business_settings").select("*").eq("id", 1).single(),
      ]);

      if (orderError) {
        setError(orderError.message);
      } else {
        setOrder(orderData);
      }
      setBusiness(businessData);
      setLoading(false);
    };
    load();
  }, [id]);

  const currency = (n) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

  if (loading) {
    return (
      <div className="receipt-shell">
        <Loader label="Loading receipt…" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="receipt-shell">
        <p>Couldn't load this order{error ? `: ${error}` : "."}</p>
        <button type="button" className="btn btn-ghost" onClick={() => navigate("/orders")}>
          <LuArrowLeft size={16} /> Back to Orders
        </button>
      </div>
    );
  }

  const receiptNumber = order.id.slice(0, 8).toUpperCase();

  return (
    <div className="receipt-shell">
      <div className="receipt-toolbar no-print">
        <button type="button" className="btn btn-ghost" onClick={() => navigate("/orders")}>
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
            <p>{new Date(order.order_date || order.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="receipt-divider" />

        <div className="receipt-parties">
          <div>
            <span className="receipt-label">Billed to</span>
            <p className="receipt-strong">{order.customers?.name || "—"}</p>
            {order.customers?.phone && <p>{order.customers.phone}</p>}
            {order.customers?.email && <p>{order.customers.email}</p>}
            {order.customers?.address && <p>{order.customers.address}</p>}
          </div>
          <div>
            <span className="receipt-label">Order status</span>
            <p className="receipt-strong" style={{ textTransform: "capitalize" }}>{order.order_status}</p>
            <span className="receipt-label" style={{ marginTop: 10, display: "block" }}>Payment status</span>
            <p className="receipt-strong" style={{ textTransform: "capitalize" }}>{order.payment_status}</p>
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
                <p className="receipt-strong">{order.services?.name || "Service"}</p>
                {order.services?.description && <p className="receipt-item-desc">{order.services.description}</p>}
              </td>
              <td style={{ textAlign: "right" }}>{currency(order.amount)}</td>
            </tr>
          </tbody>
        </table>

        <div className="receipt-total-row">
          <span>Total</span>
          <span>{currency(order.amount)}</span>
        </div>

        <div className="receipt-divider" />

        <p className="receipt-footer-note">
          Thank you for choosing {business?.business_name || "HARYHORDHEYLEY Smart Tech Digital Service"}.
        </p>
      </div>
    </div>
  );
}

export default Receipt;
