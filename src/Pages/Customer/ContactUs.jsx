import { useEffect, useState } from "react";
import { LuPhone, LuMail, LuMapPin, LuClock, LuMessageCircle } from "react-icons/lu";
import { supabase } from "../../supabase/supabaseClient";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import "../../Styles/CustomerPortal.css";

function ContactUs() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    supabase.from("business_settings").select("*").eq("id", 1).single().then(({ data }) => setBusiness(data));
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);

    await supabase.from("messages").insert({ customer_id: user.id, sender_id: user.id, body: message.trim() });

    const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");
    if (admins?.length) {
      await supabase.from("notifications").insert(
        admins.map((a) => ({ recipient_id: a.id, title: `Message from ${profile?.full_name || "a customer"}`, message: message.trim() }))
      );
    }

    setSending(false);
    setMessage("");
    showToast("Message sent — we'll get back to you soon.");
  };

  return (
    <div className="portal-page">
      <div className="portal-page-head">
        <span className="eyebrow">Get in touch</span>
        <h1>Contact Us</h1>
        <p>We'd love to hear from you — reach out any of these ways.</p>
      </div>

      <div className="contact-grid">
        <div className="portal-card">
          <h3>Contact Details</h3>
          <div className="contact-info-item">
            <LuPhone size={18} />
            <div>
              <h4>Phone / WhatsApp</h4>
              <p>{business?.phone || "Message us and we'll share our number"}</p>
            </div>
          </div>
          <div className="contact-info-item">
            <LuMail size={18} />
            <div>
              <h4>Email</h4>
              <p>{business?.email || "Reach out via the form and we'll reply directly"}</p>
            </div>
          </div>
          <div className="contact-info-item">
            <LuMapPin size={18} />
            <div>
              <h4>Location</h4>
              <p>{business?.address || "Serving customers wherever you are"}</p>
            </div>
          </div>
          <div className="contact-info-item">
            <LuClock size={18} />
            <div>
              <h4>Working Hours</h4>
              <p>Mon – Sat, 9am – 6pm</p>
            </div>
          </div>
        </div>

        <div className="portal-card">
          <h3><LuMessageCircle size={16} style={{ verticalAlign: "-2px" }} /> Send us a message</h3>
          <form onSubmit={handleSend}>
            <div className="form-field full">
              <label>Your message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Tell us what you need help with…" required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={sending} style={{ marginTop: 12 }}>
              {sending ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;