import { useEffect, useRef, useState } from "react";
import { LuSend } from "react-icons/lu";
import { supabase } from "../../supabase/supabaseClient";
import { useAuth } from "../../Context/AuthContext";
import Loader from "../../Components/UI/Loader";
import "../../Styles/CustomerPortal.css";

function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setLoading(false);

    // mark incoming (admin) messages as read
    await supabase.from("messages").update({ is_read: true }).eq("customer_id", user.id).neq("sender_id", user.id).eq("is_read", false);
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      customer_id: user.id,
      sender_id: user.id,
      body: body.trim(),
    });

    setSending(false);
    if (!error) {
      setBody("");
      load();

      // notify admins of the new message
      const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");
      if (admins?.length) {
        await supabase.from("notifications").insert(
          admins.map((a) => ({ recipient_id: a.id, title: "New message", message: "A customer sent you a message." }))
        );
      }
    }
  };

  return (
    <div className="portal-page">
      <div className="portal-page-head">
        <span className="eyebrow">Talk to us</span>
        <h1>Messages</h1>
        <p>Chat directly with the HARYHORDHEYLEY team.</p>
      </div>

      <div className="portal-card" style={{ padding: 0 }}>
        {loading ? (
          <Loader label="Loading conversation…" />
        ) : (
          <div className="message-thread">
            {messages.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--color-white)", padding: 20 }}>No messages yet — say hello!</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`message-bubble ${m.sender_id === user.id ? "mine" : "theirs"}`}>
                  {m.body}
                  <span className="message-bubble-time">{new Date(m.created_at).toLocaleString()}</span>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        )}
        <form className="message-input-row" onSubmit={handleSend}>
          <input type="text" placeholder="Type a message…" value={body} onChange={(e) => setBody(e.target.value)} />
          <button type="submit" className="btn btn-primary" disabled={sending}>
            <LuSend size={15} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Messages;