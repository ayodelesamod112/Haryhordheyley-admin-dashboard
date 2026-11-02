import { useEffect, useRef, useState } from "react";
import { LuSend } from "react-icons/lu";
import { supabase } from "../supabase/supabaseClient";
import { useAuth } from "../Context/AuthContext";
import Loader from "../Components/UI/Loader";
import EmptyState from "../Components/UI/EmptyState";

function AdminMessages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeCustomerId, setActiveCustomerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadThreads = async () => {
    setLoadingThreads(true);
    const { data: customers } = await supabase.from("profiles").select("id, full_name").eq("role", "customer");
    const { data: allMessages } = await supabase.from("messages").select("*").order("created_at", { ascending: false });

    const threadList = (customers || [])
      .map((c) => {
        const theirMessages = (allMessages || []).filter((m) => m.customer_id === c.id);
        if (theirMessages.length === 0) return null;
        const unread = theirMessages.filter((m) => !m.is_read && m.sender_id !== user.id).length;
        return { customerId: c.id, name: c.full_name, lastMessage: theirMessages[0], unread };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at));

    setThreads(threadList);
    setLoadingThreads(false);
  };

  useEffect(() => {
    loadThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openThread = async (customerId) => {
    setActiveCustomerId(customerId);
    setLoadingMessages(true);
    const { data } = await supabase.from("messages").select("*").eq("customer_id", customerId).order("created_at", { ascending: true });
    setMessages(data || []);
    setLoadingMessages(false);
    await supabase.from("messages").update({ is_read: true }).eq("customer_id", customerId).neq("sender_id", user.id).eq("is_read", false);
    loadThreads();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !activeCustomerId) return;
    setSending(true);

    await supabase.from("messages").insert({ customer_id: activeCustomerId, sender_id: user.id, body: reply.trim() });
    await supabase.from("notifications").insert({ recipient_id: activeCustomerId, title: "New reply", message: reply.trim() });

    setReply("");
    setSending(false);
    openThread(activeCustomerId);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Conversations</span>
          <h1>Messages</h1>
          <p className="page-subtitle">Reply to customers reaching out through the website.</p>
        </div>
      </div>

      <div className="card" style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: 480 }}>
        <div style={{ borderRight: "1px solid var(--color-border)", overflowY: "auto" }}>
          {loadingThreads ? (
            <Loader label="Loading conversations…" />
          ) : threads.length === 0 ? (
            <EmptyState title="No messages yet" />
          ) : (
            threads.map((t) => (
              <div
                key={t.customerId}
                onClick={() => openThread(t.customerId)}
                style={{
                  padding: "14px 16px",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--color-border)",
                  background: activeCustomerId === t.customerId ? "var(--color-surface)" : "transparent",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: 13 }}>{t.name || "Customer"}</strong>
                  {t.unread > 0 && <span className="badge badge-warning">{t.unread}</span>}
                </div>
                <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {t.lastMessage.body}
                </p>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {!activeCustomerId ? (
            <div style={{ margin: "auto", color: "var(--color-muted)" }}>Select a conversation to view it</div>
          ) : loadingMessages ? (
            <Loader label="Loading messages…" />
          ) : (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: m.sender_id === user.id ? "flex-end" : "flex-start",
                      maxWidth: "70%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      fontSize: 13,
                      background: m.sender_id === user.id ? "var(--color-black)" : "var(--color-neutral-bg)",
                      color: m.sender_id === user.id ? "var(--color-white)" : "var(--color-ink)",
                    }}
                  >
                    {m.body}
                    <span style={{ display: "block", fontSize: 10, opacity: 0.6, marginTop: 4 }}>{new Date(m.created_at).toLocaleString()}</span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={handleReply} style={{ display: "flex", gap: 10, padding: 14, borderTop: "1px solid var(--color-border)" }}>
                <input type="text" placeholder="Type a reply…" value={reply} onChange={(e) => setReply(e.target.value)} style={{ flex: 1 }} />
                <button type="submit" className="btn btn-primary" disabled={sending}><LuSend size={14} /> Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminMessages;