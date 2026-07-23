import { useEffect, useState } from "react";
import { LuBellOff, LuCheck } from "react-icons/lu";
import { supabase } from "../supabase/supabaseClient";
import { useAuth } from "../Context/AuthContext";
import Loader from "../Components/UI/Loader";
import EmptyState from "../Components/UI/EmptyState";

function Notifications() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const markRead = async (id) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    const unreadIds = items.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Inbox</span>
          <h1>Notifications</h1>
          <p className="page-subtitle">Updates about orders, payments, and account activity.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={markAllRead}>
          <LuCheck size={16} /> Mark all as read
        </button>
      </div>

      <div className="card">
        {loading ? (
          <Loader label="Loading notifications…" />
        ) : items.length === 0 ? (
          <EmptyState title="No notifications" message="You're all caught up — nothing here yet." />
        ) : (
          <div>
            {items.map((n) => (
              <div key={n.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "16px 24px", borderBottom: "1px solid var(--color-border)", background: n.is_read ? "transparent" : "rgba(255,199,44,0.06)" }}>
                <div>
                  <p style={{ color: "var(--color-ink)", fontWeight: 600, fontSize: 14 }}>{n.title}</p>
                  {n.message && <p style={{ fontSize: 13, marginTop: 4 }}>{n.message}</p>}
                  <p style={{ fontSize: 11, marginTop: 6, fontFamily: "var(--font-mono)" }}>{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => markRead(n.id)}>
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
