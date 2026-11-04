import { useEffect, useState } from "react";
import { LuPlus, LuUpload } from "react-icons/lu";
import { supabase } from "../../supabase/supabaseClient";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import Modal from "../../Components/UI/Modal";
import StatusBadge from "../../Components/UI/StatusBadge";
import Loader from "../../Components/UI/Loader";
import EmptyState from "../../Components/UI/EmptyState";
import "../../Styles/CustomerPortal.css";

function MyPayments() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [payments, setPayments] = useState([]);
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ orderId: "", amount: "", method: "bank_transfer" });
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const currency = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);
  const selectedOrder = unpaidOrders.find((order) => order.id === form.orderId);

  const load = async () => {
    setLoading(true);
    const [{ data: pays }, { data: orders }] = await Promise.all([
      supabase.from("payments").select("*, orders(services(name))").eq("placed_by", user.id).order("created_at", { ascending: false }),
      supabase.from("orders").select("id, amount, services(name)").eq("placed_by", user.id).in("payment_status", ["unpaid", "partial"]),
    ]);
    const paidByOrder = (pays || []).reduce((totals, payment) => {
      if (payment.status === "success") {
        totals[payment.order_id] = (totals[payment.order_id] || 0) + Number(payment.amount || 0);
      }
      return totals;
    }, {});
    setPayments(pays || []);
    setUnpaidOrders((orders || [])
      .map((order) => ({
        ...order,
        remainingAmount: Math.max(0, Number(order.amount) - (paidByOrder[order.id] || 0)),
      }))
      .filter((order) => order.remainingAmount > 0));
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => () => {
    if (proofPreview) URL.revokeObjectURL(proofPreview);
  }, [proofPreview]);

  const openCreate = () => {
    setForm({ orderId: "", amount: "", method: "bank_transfer" });
    setProofFile(null);
    setProofPreview(null);
    setError("");
    setModalOpen(true);
  };

  const closeCreate = () => {
    setModalOpen(false);
    setProofFile(null);
    setProofPreview(null);
    setError("");
  };

  const onOrderChange = (orderId) => {
    const ord = unpaidOrders.find((o) => o.id === orderId);
    setForm((prev) => ({ ...prev, orderId, amount: ord ? ord.remainingAmount : prev.amount }));
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setProofFile(null);
      setProofPreview(null);
      setError("Upload a JPG or PNG image.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProofFile(null);
      setProofPreview(null);
      setError("The proof image must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }
    setError("");
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.orderId) {
      setError("Select which order this payment is for.");
      return;
    }
    if (!proofFile) {
      setError("Please upload proof of payment.");
      return;
    }
    if (Number(form.amount) <= 0) {
      setError("Enter a payment amount greater than zero.");
      return;
    }

    setSaving(true);
    setError("");

    const filePath = `${user.id}/${Date.now()}-${proofFile.name}`;
    const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(filePath, proofFile, {
      contentType: proofFile.type,
      upsert: false,
    });

    if (uploadError) {
      setSaving(false);
      setError(uploadError.message);
      return;
    }

    const { error: insertError } = await supabase.from("payments").insert({
      order_id: form.orderId,
      placed_by: user.id,
      amount: Number(form.amount) || 0,
      method: form.method,
      status: "pending",
      proof_path: filePath,
      paid_at: new Date().toISOString().slice(0, 10),
    });

    setSaving(false);

    if (insertError) {
      await supabase.storage.from("payment-proofs").remove([filePath]);
      setError(insertError.message);
      return;
    }

    showToast("Payment proof submitted — awaiting confirmation.");
    setModalOpen(false);
    setProofFile(null);
    setProofPreview(null);
    load();
  };

  return (
    <div className="portal-page">
      <div className="portal-page-head">
        <span className="eyebrow">Your payments</span>
        <h1>My Payments</h1>
        <p>Upload proof of payment and track confirmation status.</p>
      </div>

      <button type="button" className="btn btn-primary" style={{ marginBottom: 20 }} onClick={openCreate} disabled={unpaidOrders.length === 0}>
        <LuPlus size={16} /> Upload Payment Proof
      </button>
      {unpaidOrders.length === 0 && <p style={{ fontSize: 13, marginBottom: 20 }}>No unpaid orders right now.</p>}

      {loading ? (
        <Loader label="Loading your payments…" />
      ) : payments.length === 0 ? (
        <EmptyState title="No payments yet" message="Once you upload a payment, it'll show up here." />
      ) : (
        <div className="table-wrap card">
          <table className="data-table">
            <thead><tr><th>Service</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="cell-primary">{p.orders?.services?.name || "—"}</td>
                  <td>{currency(p.amount)}</td>
                  <td className="cell-muted">{String(p.method).replace("_", " ")}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td className="cell-muted">{new Date(p.paid_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal title="Upload Payment Proof" onClose={closeCreate}>
          <form onSubmit={handleSubmit}>
            {error && <div className="form-error-banner">{error}</div>}
            <div className="form-field full">
              <label>Which order is this for?</label>
              <select value={form.orderId} onChange={(e) => onOrderChange(e.target.value)} required>
                <option value="">Select order</option>
                {unpaidOrders.map((o) => (
                  <option key={o.id} value={o.id}>{o.services?.name || "Order"} — {currency(o.remainingAmount)} remaining</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Amount (₦)</label>
              <input type="number" min="0.01" max={selectedOrder?.remainingAmount} step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Payment method</label>
              <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                <option value="bank_transfer">Bank transfer</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="pos">POS</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-field full">
              <label>Proof of payment (JPG or PNG, up to 5 MB)</label>
              <label className="upload-drop">
                {proofPreview ? <img src={proofPreview} alt="Proof preview" /> : <><LuUpload size={22} /><p style={{ marginTop: 8 }}>Click to upload an image</p></>}
                <input type="file" accept="image/jpeg,image/png" hidden onChange={onFileChange} />
              </label>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={closeCreate}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Submitting…" : "Submit Payment"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default MyPayments;
