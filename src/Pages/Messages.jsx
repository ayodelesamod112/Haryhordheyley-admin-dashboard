import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useAuth } from "../Context/AuthContext";
import Loader from "../Components/UI/Loader";
import "../Styles/CustomerPortal.css";

function Messages() {
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

  return (
    <div className="portal-page">
      <div className="portal-page-head">
        <span className="eyebrow">Your inbox</span>
        <h1>Messages</h1>
        <p>Replies and updates from HARYHORDHEYLEY will show up here.</p>
      </div>

      {loading ? (
        <Loader label="Loading messages…" />
      ) : items.length === 0 ? (
        <p className="portal-empty">No messages yet.</p>
      ) : (
        <div className="portal-card" style={{ padding: 0 }}>
          {items.map((n) => (
            <div key={n.id} className={`portal-message-item ${n.is_read ? "" : "unread"}`}>
              <div>
                <p className="portal-message-title">{n.title}</p>
                {n.message && <p className="portal-message-body">{n.message}</p>}
                <p className="portal-message-date">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.is_read && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => markRead(n.id)}>Mark read</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Messages;