import { useEffect, useState } from "react";
import { LuPencil } from "react-icons/lu";
import { useCrudTable } from "../hooks/useCrudTable";
import { useSearch } from "../Context/SearchContext";
import { useToast } from "../Context/ToastContext";
import Modal from "../Components/UI/Modal";
import StatusBadge from "../Components/UI/StatusBadge";
import Loader from "../Components/UI/Loader";
import EmptyState from "../Components/UI/EmptyState";
import Pagination from "../Components/UI/Pagination";

function Users() {
  const { query } = useSearch();
  const { showToast } = useToast();
  const {
    rows, loading, error, page, setPage, totalPages, search, setSearch,
    updateRow,
  } = useCrudTable("profiles", { searchColumns: ["full_name"] });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [form, setForm] = useState({ role: "admin", status: "active" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setSearch(query); }, [query, setSearch]);

  const openEdit = (row) => {
    setEditingRow(row);
    setForm({ role: row.role || "admin", status: row.status || "active" });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error: updateError } = await updateRow(editingRow.id, form);
    setSaving(false);
    if (updateError) {
      showToast(updateError.message, "error");
      return;
    }
    showToast("User updated");
    setModalOpen(false);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Team</span>
          <h1>Staff &amp; Admin Users</h1>
          <p className="page-subtitle">Everyone who can sign in to this dashboard. New staff join via the Sign Up page.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <input type="search" placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 14 }} />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Loader label="Loading users…" />
        ) : error ? (
          <div className="form-error-banner" style={{ margin: 20 }}>{error}</div>
        ) : rows.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u) => (
                    <tr key={u.id}>
                      <td className="cell-primary">{u.full_name || "—"}</td>
                      <td className="cell-muted">{u.phone || "—"}</td>
                      <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                      <td><StatusBadge status={u.status} /></td>
                      <td className="cell-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(u)} aria-label="Edit"><LuPencil size={15} /></button>
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
        <Modal title={`Edit ${editingRow?.full_name || "User"}`} onClose={() => setModalOpen(false)} width="400px">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field full">
                <label>Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="form-field full">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Users;
