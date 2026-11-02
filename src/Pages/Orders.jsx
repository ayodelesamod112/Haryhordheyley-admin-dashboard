import { useEffect, useState } from "react";
import { LuPlus, LuPencil, LuTrash2 } from "react-icons/lu";
import { useCrudTable } from "../hooks/useCrudTable";
import { useToast } from "../Context/ToastContext";
import { useAuth } from "../Context/AuthContext";
import { supabase } from "../supabase/supabaseClient";
import Modal from "../Components/UI/Modal";
import ConfirmDialog from "../Components/UI/ConfirmDialog";
import StatusBadge from "../Components/UI/StatusBadge";
import Loader from "../Components/UI/Loader";
import EmptyState from "../Components/UI/EmptyState";
import Pagination from "../Components/UI/Pagination";

const EMPTY_FORM = {
  customer_id: "", service_id: "", amount: "", payment_status: "unpaid",
  order_status: "pending", order_date: new Date().toISOString().slice(0, 10),
};

function Orders() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const {
    rows, loading, error, page, setPage, totalPages, filters, setFilters,
    createRow, updateRow, deleteRow,
  } = useCrudTable("orders", { selectQuery: "*, customers(name), services(name, price)" });

  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      const [{ data: c }, { data: s }] = await Promise.all([
        supabase.from("customers").select("id, name").order("name"),
        supabase.from("services").select("id, name, price").order("name"),
      ]);
      setCustomers(c || []);
      setServices(s || []);
    };
    loadOptions();
  }, []);

  const currency = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      customer_id: row.customer_id || "", service_id: row.service_id || "", amount: row.amount ?? "",
      payment_status: row.payment_status, order_status: row.order_status, order_date: row.order_date,
    });
    setFormError("");
    setModalOpen(true);
  };

  const onServiceChange = (serviceId) => {
    const svc = services.find((s) => s.id === serviceId);
    setForm((prev) => ({ ...prev, service_id: serviceId, amount: svc ? svc.price : prev.amount }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_id || !form.service_id) {
      setFormError("Select a customer and a service.");
      return;
    }
    setSaving(true);
    setFormError("");

    const payload = { ...form, amount: Number(form.amount) || 0, created_by: user?.id };
    const result = editingId ? await updateRow(editingId, payload) : await createRow(payload);
    setSaving(false);

    if (result.error) {
      setFormError(result.error.message);
      return;
    }
    showToast(editingId ? "Order updated" : "Order created");
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
    showToast("Order deleted");
    setDeleteTarget(null);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Orders</span>
          <h1>Order Management</h1>
          <p className="page-subtitle">Track every job from request to completion.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <LuPlus size={16} /> Create Order
        </button>
      </div>

      <div className="toolbar">
        <select className="toolbar-select" value={filters.order_status || ""} onChange={(e) => setFilters({ ...filters, order_status: e.target.value })}>
          <option value="">All order statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="toolbar-select" value={filters.payment_status || ""} onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}>
          <option value="">All payment statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <Loader label="Loading orders…" />
        ) : error ? (
          <div className="form-error-banner" style={{ margin: 20 }}>{error}</div>
        ) : rows.length === 0 ? (
          <EmptyState title="No orders found" message="Create your first order to get started." actionLabel="Create Order" onAction={openCreate} />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((o) => (
                    <tr key={o.id}>
                      <td className="cell-primary">{o.customers?.name || "—"}</td>
                      <td className="cell-muted">{o.services?.name || "—"}</td>
                      <td>{currency(o.amount)}</td>
                      <td><StatusBadge status={o.payment_status} /></td>
                      <td><StatusBadge status={o.order_status} /></td>
                      <td className="cell-muted">{o.order_date}</td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(o)} aria-label="Edit"><LuPencil size={15} /></button>
                          <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => setDeleteTarget(o)} aria-label="Delete"><LuTrash2 size={15} /></button>
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
        <Modal title={editingId ? "Edit Order" : "Create Order"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            {formError && <div className="form-error-banner">{formError}</div>}
            <div className="form-grid">
              <div className="form-field full">
                <label>Customer</label>
                <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} required>
                  <option value="">Select customer</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-field full">
                <label>Service</label>
                <select value={form.service_id} onChange={(e) => onServiceChange(e.target.value)} required>
                  <option value="">Select service</option>
                  {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Amount (₦)</label>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Order date</label>
                <input type="date" value={form.order_date} onChange={(e) => setForm({ ...form, order_date: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Payment status</label>
                <select value={form.payment_status} onChange={(e) => setForm({ ...form, payment_status: e.target.value })}>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div className="form-field">
                <label>Order status</label>
                <select value={form.order_status} onChange={(e) => setForm({ ...form, order_status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Order"}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message="Delete this order? This can't be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

export default Orders;
