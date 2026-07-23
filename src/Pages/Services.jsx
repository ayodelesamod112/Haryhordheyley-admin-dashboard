import { useEffect, useState } from "react";
import { LuSearch, LuPlus, LuPencil, LuTrash2 } from "react-icons/lu";
import { useCrudTable } from "../hooks/useCrudTable";
import { useSearch } from "../Context/SearchContext";
import { useToast } from "../Context/ToastContext";
import { useAuth } from "../Context/AuthContext";
import Modal from "../Components/UI/Modal";
import ConfirmDialog from "../Components/UI/ConfirmDialog";
import StatusBadge from "../Components/UI/StatusBadge";
import Loader from "../Components/UI/Loader";
import EmptyState from "../Components/UI/EmptyState";
import Pagination from "../Components/UI/Pagination";

const EMPTY_FORM = { name: "", description: "", category: "", price: "", status: "active" };

function Services() {
  const { query } = useSearch();
  const { showToast } = useToast();
  const { user } = useAuth();
  const {
    rows, loading, error, page, setPage, totalPages, search, setSearch, filters, setFilters,
    createRow, updateRow, deleteRow,
  } = useCrudTable("services", { searchColumns: ["name", "category", "description"] });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { setSearch(query); }, [query, setSearch]);

  const currency = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({ name: row.name || "", description: row.description || "", category: row.category || "", price: row.price ?? "", status: row.status || "active" });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Service name is required.");
      return;
    }
    if (form.price === "" || Number(form.price) < 0) {
      setFormError("Enter a valid price.");
      return;
    }
    setSaving(true);
    setFormError("");

    const payload = { ...form, price: Number(form.price), created_by: user?.id };
    const result = editingId ? await updateRow(editingId, payload) : await createRow(payload);
    setSaving(false);

    if (result.error) {
      setFormError(result.error.message);
      return;
    }
    showToast(editingId ? "Service updated" : "Service created");
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
    showToast("Service deleted");
    setDeleteTarget(null);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Services</span>
          <h1>Service Catalog</h1>
          <p className="page-subtitle">Everything HARYHORDHEYLEY offers, priced and organized.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <LuPlus size={16} /> Add Service
        </button>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <LuSearch size={16} />
          <input type="search" placeholder="Search by name or category…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="toolbar-select" value={filters.status || ""} onChange={(e) => setFilters({ status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <Loader label="Loading services…" />
        ) : error ? (
          <div className="form-error-banner" style={{ margin: 20 }}>{error}</div>
        ) : rows.length === 0 ? (
          <EmptyState title="No services yet" message="Add the first service HARYHORDHEYLEY offers." actionLabel="Add Service" onAction={openCreate} />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="cell-primary">{s.name}</div>
                        {s.description && <div className="cell-muted" style={{ fontSize: 12, marginTop: 2 }}>{s.description}</div>}
                      </td>
                      <td className="cell-muted">{s.category || "—"}</td>
                      <td>{currency(s.price)}</td>
                      <td><StatusBadge status={s.status} /></td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(s)} aria-label="Edit"><LuPencil size={15} /></button>
                          <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => setDeleteTarget(s)} aria-label="Delete"><LuTrash2 size={15} /></button>
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
        <Modal title={editingId ? "Edit Service" : "Add Service"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            {formError && <div className="form-error-banner">{formError}</div>}
            <div className="form-grid">
              <div className="form-field full">
                <label>Service name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-field full">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Category</label>
                <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Price (₦)</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Service"}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.name}"? This can't be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

export default Services;
