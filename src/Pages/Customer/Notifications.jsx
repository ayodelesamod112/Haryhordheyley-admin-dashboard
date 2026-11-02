import { useEffect, useState } from "react";
import { LuCheck } from "react-icons/lu";
import { supabase } from "../../supabase/supabaseClient";
import { useAuth } from "../../Context/AuthContext";
import Loader from "../../Components/UI/Loader";
import EmptyState from "../../Components/UI/EmptyState";
import "../../Styles/CustomerPortal.css";

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
    const unread = items.filter((n) => !n.is_read).map((n) => n.id);
    if (unread.length === 0) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", unread);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="portal-page">
      <div className="portal-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <span className="eyebrow">Updates</span>
          <h1>Notifications</h1>
          <p>Order updates, payment confirmations, and messages from us.</p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={markAllRead}><LuCheck size={14} /> Mark all read</button>
      </div>

      {loading ? (
        <Loader label="Loading notifications…" />
      ) : items.length === 0 ? (
        <EmptyState title="No notifications" message="You're all caught up." />
      ) : (
        <div className="portal-card" style={{ padding: 0 }}>
          {items.map((n) => (
            <div key={n.id} className={`portal-message-item ${n.is_read ? "" : "unread"}`}>
              <div>
                <p className="portal-message-title">{n.title}</p>
                {n.message && <p className="portal-message-body">{n.message}</p>}
                <p className="portal-message-date">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.is_read && <button type="button" className="btn btn-ghost btn-sm" onClick={() => markRead(n.id)}>Mark read</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;