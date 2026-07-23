import { useEffect, useState } from "react";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { useCrudTable } from "../hooks/useCrudTable";
import { useToast } from "../Context/ToastContext";
import { useAuth } from "../Context/AuthContext";
import { supabase } from "../supabase/supabaseClient";
import Modal from "../Components/UI/Modal";
import ConfirmDialog from "../Components/UI/ConfimDialog";
import StatusBadge from "../Components/UI/StatusBadge";
import Loader from "../Components/UI/Loader";
import EmptyState from "../Components/UI/EmptyState";
import Pagination from "../Components/UI/Pagination";

const EMPTY_FORM = { order_id: "", amount: "", method: "cash", status: "success", paid_at: new Date().toISOString().slice(0, 10) };

function Payments() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const {
    rows, loading, error, page, setPage, totalPages, filters, setFilters,
    createRow, deleteRow,
  } = useCrudTable("payments", { selectQuery: "*, orders(id, customers(name))" });

  const [orders, setOrders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);


  useEffect(() => {
    const loadOrders = async () => {
      const { data, error: ordersError } = await supabase
        .from("orders")
        .select("id, amount, customer_id, customers(name)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (ordersError) {
        console.error("Failed to load orders for payment form:", ordersError.message);
      }
      setOrders(data || []);
    };
    loadOrders();
  }, []);

  const currency = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const onOrderChange = (orderId) => {
    const ord = orders.find((o) => o.id === orderId);
    setForm((prev) => ({ ...prev, order_id: orderId, amount: ord ? ord.amount : prev.amount }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.order_id) {
      setFormError("Select the order this payment is for.");
      return;
    }
    setSaving(true);
    setFormError("");

    const relatedOrder = orders.find((o) => o.id === form.order_id);
    const payload = {
      order_id: form.order_id,
      customer_id: relatedOrder?.customer_id,
      amount: Number(form.amount) || 0,
      method: form.method,
      status: form.status,
      paid_at: form.paid_at,
      created_by: user?.id,
    };
    const result = await createRow(payload);
    setSaving(false);

    if (result.error) {
      setFormError(result.error.message);
      return;
    }
    showToast("Payment recorded");
    setModalOpen(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error: deleteError } = await deleteRow(deleteTarget.id);
    setDeleting(false);
    if (deleteError) {
      showToast(deleteError.message, "error");
      return;
    }
    showToast("Payment removed");
    setDeleteTarget(null);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Payments</span>
          <h1>Payment History</h1>
          <p className="page-subtitle">Every payment recorded against an order.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <LuPlus size={16} /> Record Payment
        </button>
      </div>

      <div className="toolbar">
        <select className="toolbar-select" value={filters.status || ""} onChange={(e) => setFilters({ status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select className="toolbar-select" value={filters.method || ""} onChange={(e) => setFilters({ method: e.target.value })}>
          <option value="">All methods</option>
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank transfer</option>
          <option value="card">Card</option>
          <option value="pos">POS</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <Loader label="Loading payments…" />
        ) : error ? (
          <div className="form-error-banner" style={{ margin: 20 }}>{error}</div>
        ) : rows.length === 0 ? (
          <EmptyState title="No payments recorded" message="Payments you record will appear here." actionLabel="Record Payment" onAction={openCreate} />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id}>
                      <td className="cell-primary">{p.orders?.customers?.name || "—"}</td>
                      <td>{currency(p.amount)}</td>
                      <td className="cell-muted">{String(p.method).replace("_", " ")}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td className="cell-muted">{new Date(p.paid_at).toLocaleDateString()}</td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => setDeleteTarget(p)} aria-label="Delete"><LuTrash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {modalOpen && (
        <Modal title="Record Payment" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            {formError && <div className="form-error-banner">{formError}</div>}
            <div className="form-grid">
              <div className="form-field full">
                <label>Order</label>
                <select value={form.order_id} onChange={(e) => onOrderChange(e.target.value)} required>
                  <option value="">Select order</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.customers?.name || "Customer"} — {currency(o.amount)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Amount (₦)</label>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Date</label>
                <input type="date" value={form.paid_at} onChange={(e) => setForm({ ...form, paid_at: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Method</label>
                <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="card">Card</option>
                  <option value="pos">POS</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Payment"}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message="Delete this payment record? This can't be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

export default Payments;
