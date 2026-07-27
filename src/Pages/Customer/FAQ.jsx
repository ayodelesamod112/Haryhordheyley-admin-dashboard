import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import "../../Styles/CustomerPortal.css";

const FAQS = [
  { q: "How long does a typical service take?", a: "Most services are completed within 24–72 hours depending on complexity. We'll always give you a clear timeline before starting." },
  { q: "How do I pay?", a: "Once your order is confirmed, upload proof of payment directly from My Payments, or pay in person." },
  { q: "Can I track my order?", a: "Yes — every order shows up in My Orders with a live status: Pending, Processing, or Completed." },
  { q: "Can I cancel an order?", a: "Yes, as long as it's still Pending. Once it moves to Processing, please message us instead." },
  { q: "How do I get my receipt?", a: "Once a payment is confirmed, it automatically appears in My Receipts, ready to view and print." },
  { q: "What if I'm not satisfied?", a: "Reach out through Messages or Contact Us and we'll work with you to make it right." },
];

function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="portal-page">
      <div className="portal-page-head">
        <span className="eyebrow">Need help?</span>
        <h1>Frequently Asked Questions</h1>
        <p>Answers to the things customers ask us most.</p>
      </div>

      <div className="portal-card">
        {FAQS.map((f, i) => (
          <div key={f.q} className="faq-item" onClick={() => setOpen(open === i ? null : i)}>
            <div className="faq-question">
              {f.q}
              <LuChevronDown size={16} style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }} />
            </div>
            {open === i && <p className="faq-answer">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQ;