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

const EMPTY_FORM = { name: "", phone: "", email: "", address: "", status: "active" };

function Customers() {
  const { query } = useSearch();
  const { showToast } = useToast();
  const { user } = useAuth();
  const {
    rows, loading, error, page, setPage, totalPages, search, setSearch, filters, setFilters,
    createRow, updateRow, deleteRow,
  } = useCrudTable("customers", { searchColumns: ["name", "email", "phone"] });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Let the navbar search box drive this page's filtering too
  useEffect(() => {
    setSearch(query);
  }, [query, setSearch]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({ name: row.name || "", phone: row.phone || "", email: row.email || "", address: row.address || "", status: row.status || "active" });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    setSaving(true);
    setFormError("");

    const payload = { ...form, created_by: user?.id };
    const result = editingId ? await updateRow(editingId, payload) : await createRow(payload);
    setSaving(false);

    if (result.error) {
      setFormError(result.error.message);
      return;
    }
    showToast(editingId ? "Customer updated" : "Customer created");
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
    showToast("Customer deleted");
    setDeleteTarget(null);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Customers</span>
          <h1>Customer Management</h1>
          <p className="page-subtitle">Add, edit, and track everyone HARYHORDHEYLEY serves.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <LuPlus size={16} /> Add Customer
        </button>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <LuSearch size={16} />
          <input type="search" placeholder="Search by name, email or phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="toolbar-select" value={filters.status || ""} onChange={(e) => setFilters({ status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <Loader label="Loading customers…" />
        ) : error ? (
          <div className="form-error-banner" style={{ margin: 20 }}>{error}</div>
        ) : rows.length === 0 ? (
          <EmptyState title="No customers found" message="Try a different search, or add your first customer." actionLabel="Add Customer" onAction={openCreate} />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id}>
                      <td className="cell-primary">{c.name}</td>
                      <td className="cell-muted">{c.phone || "—"}</td>
                      <td className="cell-muted">{c.email || "—"}</td>
                      <td className="cell-muted">{c.address || "—"}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td className="cell-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(c)} aria-label="Edit"><LuPencil size={15} /></button>
                          <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => setDeleteTarget(c)} aria-label="Delete"><LuTrash2 size={15} /></button>
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
        <Modal title={editingId ? "Edit Customer" : "Add Customer"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            {formError && <div className="form-error-banner">{formError}</div>}
            <div className="form-grid">
              <div className="form-field full">
                <label>Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-field full">
                <label>Address</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Customer"}</button>
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

export default Customers;
