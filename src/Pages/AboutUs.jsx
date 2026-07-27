import { useState } from "react";
import { LuPhone, LuMail, LuMapPin } from "react-icons/lu";
import { supabase } from "../supabase/supabaseClient";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import "../Styles/CustomerPortal.css";

function AboutUs() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);

    const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");
    if (admins && admins.length > 0) {
      const rows = admins.map((admin) => ({
        recipient_id: admin.id,
        title: `Message from ${profile?.full_name || user?.email}`,
        message: message.trim(),
      }));
      await supabase.from("notifications").insert(rows);
    }

    setSending(false);
    setMessage("");
    showToast("Message sent — we'll get back to you soon.");
  };

  return (
    <div className="portal-page">
      <div className="portal-page-head">
        <span className="eyebrow">Get in touch</span>
        <h1>About Us</h1>
        <p>
          HARYHORDHEYLEY Smart Tech Digital Service is dedicated to reliable, honest tech support —
          from repairs and installations to full digital solutions. We treat every job like it matters,
          because it does.
        </p>
      </div>

      <div className="portal-about-grid">
        <div className="portal-card">
          <h3>Contact details</h3>
          <div className="portal-contact-row"><LuPhone size={16} /> Reach out via the message form and we'll call you back</div>
          <div className="portal-contact-row"><LuMail size={16} /> Or leave your details below</div>
          <div className="portal-contact-row"><LuMapPin size={16} /> Serving customers wherever you are</div>
        </div>

        <div className="portal-card">
          <h3>Send us a message</h3>
          <form onSubmit={handleSend}>
            <div className="form-field full">
              <label>Your message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you're interested in, or what you need help with…"
                rows={5}
                required
              />
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

export default AboutUs;