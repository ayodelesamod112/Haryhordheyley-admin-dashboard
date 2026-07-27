// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   LuWrench, LuSmartphone, LuLaptop, LuWifi, LuShieldCheck, LuSparkles,
//   LuArrowRight, LuPhone, LuSearch, LuChevronDown,
// } from "react-icons/lu";
// import { supabase } from "../../supabase/supabaseClient";
// import Loader from "../../Components/UI/Loader";
// import "../../Styles/CustomerPortal.css";

// const ICON_RULES = [
//   { keywords: ["repair", "fix", "phone", "smartphone", "mobile"], icon: LuSmartphone },
//   { keywords: ["laptop", "computer", "pc", "software", "install"], icon: LuLaptop },
//   { keywords: ["network", "wifi", "internet", "social", "digital marketing"], icon: LuWifi },
//   { keywords: ["security", "protect", "branding"], icon: LuShieldCheck },
//   { keywords: ["design", "graphic", "flyer", "poster", "video", "animation", "cv", "document"], icon: LuWrench },
// ];

// function getIconFor(service) {
//   const text = `${service.category || ""} ${service.name || ""}`.toLowerCase();
//   const match = ICON_RULES.find((rule) => rule.keywords.some((k) => text.includes(k)));
//   return match ? match.icon : LuSparkles;
// }

// const TESTIMONIALS = [
//   { quote: "They fixed my laptop the same day I brought it in. Excellent service!", author: "Amaka O.", role: "Repeat Customer" },
//   { quote: "Professional, fast, and reasonably priced. Highly recommend.", author: "Tunde A.", role: "Small Business Owner" },
//   { quote: "My website design came out better than I imagined. Will be back!", author: "Chioma N.", role: "Entrepreneur" },
// ];

// const FAQS = [
//   { q: "How long does a typical service take?", a: "Most services are completed within 24–72 hours depending on complexity. We'll always give you a clear timeline before starting." },
//   { q: "How do I pay?", a: "Once your order is confirmed, you can upload proof of payment directly from your account, or pay in person." },
//   { q: "Can I track my order?", a: "Yes — every order you place shows up in 'My Orders' with a live status: Pending, Processing, or Completed." },
//   { q: "What if I'm not satisfied?", a: "Reach out through Messages and we'll work with you to make it right." },
// ];

// function Services() {
//   const navigate = useNavigate();
//   const [services, setServices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("");
//   const [openFaq, setOpenFaq] = useState(null);

//   useEffect(() => {
//     const load = async () => {
//       const { data } = await supabase.from("services").select("*").eq("status", "active").order("created_at", { ascending: false });
//       setServices(data || []);
//       setLoading(false);
//     };
//     load();
//   }, []);

//   const currency = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

//   const categories = useMemo(() => Array.from(new Set(services.map((s) => s.category).filter(Boolean))), [services]);

//   const filtered = services.filter((s) => {
//     const matchesSearch = !search.trim() || s.name.toLowerCase().includes(search.trim().toLowerCase());
//     const matchesCategory = !category || s.category === category;
//     return matchesSearch && matchesCategory;
//   });

//   const grouped = filtered.reduce((acc, s) => {
//     const key = s.category?.trim() || "General Services";
//     if (!acc[key]) acc[key] = [];
//     acc[key].push(s);
//     return acc;
//   }, {});

//   const handleOrderNow = (service) => {
//     navigate(`/portal/orders?serviceId=${service.id}`);
//   };

//   return (
//     <div>
//       <div className="services-hero">
//         <div className="services-hero-inner">
//           <span className="services-hero-eyebrow">What we offer</span>
//           <h1>Quality Tech Services, Done Right</h1>
//           <p>From quick fixes to full digital solutions — find exactly what you need below.</p>
//         </div>
//       </div>

//       <div className="portal-page" style={{ paddingTop: 30 }}>
//         <div className="services-toolbar">
//           <div className="toolbar-search" style={{ maxWidth: 280 }}>
//             <LuSearch size={16} />
//             <input type="search" placeholder="Search services…" value={search} onChange={(e) => setSearch(e.target.value)} />
//           </div>
//           <select value={category} onChange={(e) => setCategory(e.target.value)}>
//             <option value="">All categories</option>
//             {categories.map((c) => <option key={c} value={c}>{c}</option>)}
//           </select>
//         </div>

//         {loading ? (
//           <Loader label="Loading services…" />
//         ) : filtered.length === 0 ? (
//           <p className="portal-empty">No services match your search.</p>
//         ) : (
//           Object.entries(grouped).map(([cat, items]) => (
//             <div className="services-category-block" key={cat}>
//               <h2 className="services-category-title">{cat}</h2>
//               <div className="services-grid">
//                 {items.map((s) => (
//                   <div className="service-tile" key={s.id}>
//                     {s.image_url ? (
//                       <div className="service-tile-image">
//                         <img src={s.image_url} alt={s.name} />
//                       </div>
//                     ) : (
//                       <div className="service-tile-icon">{(() => { const Icon = getIconFor(s); return <Icon size={22} />; })()}</div>
//                     )}
//                     <h3>{s.name}</h3>
//                     {s.description && <p className="service-tile-desc">{s.description}</p>}
//                     <div className="service-tile-footer">
//                       <span className="service-tile-price">{currency(s.price)}</span>
//                       <button type="button" className="btn btn-primary btn-sm" onClick={() => handleOrderNow(s)}>Order Now</button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))
//         )}

//         {/* Testimonials */}
//         <h2 className="services-category-title" style={{ marginTop: 20 }}>What Our Customers Say</h2>
//         <div className="testimonial-grid">
//           {TESTIMONIALS.map((t) => (
//             <div className="testimonial-card" key={t.author}>
//               <p className="testimonial-quote">"{t.quote}"</p>
//               <p className="testimonial-author">{t.author}</p>
//               <p className="testimonial-role">{t.role}</p>
//             </div>
//           ))}
//         </div>

//         {/* FAQ */}
//         <h2 className="services-category-title">Frequently Asked Questions</h2>
//         <div className="portal-card" style={{ marginBottom: 30 }}>
//           {FAQS.map((f, i) => (
//             <div key={f.q} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
//               <div className="faq-question">
//                 {f.q}
//                 <LuChevronDown size={16} style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }} />
//               </div>
//               {openFaq === i && <p className="faq-answer">{f.a}</p>}
//             </div>
//           ))}
//         </div>

//         <div className="services-final-cta">
//           <div>
//             <h3>Ready to get started?</h3>
//             <p>Reach out and let us know what you need — we'll take it from there.</p>
//           </div>
//           <button type="button" className="btn btn-primary" onClick={() => navigate("/portal/contact")}>
//             Contact Us <LuArrowRight size={16} />
//           </button>
//         </div>

//         <div className="services-trust-strip">
//           <div><LuShieldCheck size={18} /> Trusted &amp; reliable</div>
//           <div><LuPhone size={18} /> Easy to reach</div>
//           <div><LuSparkles size={18} /> Quality guaranteed</div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Services;

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuWrench, LuSmartphone, LuLaptop, LuWifi, LuShieldCheck, LuSparkles,
  LuArrowRight, LuPhone, LuSearch, LuChevronDown,
} from "react-icons/lu";
import { supabase } from "../../supabase/supabaseClient";
import Loader from "../../Components/UI/Loader";
import "../../Styles/CustomerPortal.css";

const ICON_RULES = [
  { keywords: ["repair", "fix", "phone", "smartphone", "mobile"], icon: LuSmartphone },
  { keywords: ["laptop", "computer", "pc", "software", "install"], icon: LuLaptop },
  { keywords: ["network", "wifi", "internet", "social", "digital marketing"], icon: LuWifi },
  { keywords: ["security", "protect", "branding"], icon: LuShieldCheck },
  { keywords: ["design", "graphic", "flyer", "poster", "video", "animation", "cv", "document"], icon: LuWrench },
];

function getIconFor(service) {
  const text = `${service.category || ""} ${service.name || ""}`.toLowerCase();
  const match = ICON_RULES.find((rule) => rule.keywords.some((k) => text.includes(k)));
  return match ? match.icon : LuSparkles;
}

const TESTIMONIALS = [
  { quote: "They fixed my laptop the same day I brought it in. Excellent service!", author: "Amaka O.", role: "Repeat Customer" },
  { quote: "Professional, fast, and reasonably priced. Highly recommend.", author: "Tunde A.", role: "Small Business Owner" },
  { quote: "My website design came out better than I imagined. Will be back!", author: "Chioma N.", role: "Entrepreneur" },
];

const FAQS = [
  { q: "How long does a typical service take?", a: "Most services are completed within 24–72 hours depending on complexity. We'll always give you a clear timeline before starting." },
  { q: "How do I pay?", a: "Once your order is confirmed, you can upload proof of payment directly from your account, or pay in person." },
  { q: "Can I track my order?", a: "Yes — every order you place shows up in 'My Orders' with a live status: Pending, Processing, or Completed." },
  { q: "What if I'm not satisfied?", a: "Reach out through Messages and we'll work with you to make it right." },
];

function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("services").select("*").eq("status", "active").order("created_at", { ascending: false });
      setServices(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const categories = useMemo(() => Array.from(new Set(services.map((s) => s.category).filter(Boolean))), [services]);

  const filtered = services.filter((s) => {
    const matchesSearch = !search.trim() || s.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchesCategory = !category || s.category === category;
    return matchesSearch && matchesCategory;
  });

  const grouped = filtered.reduce((acc, s) => {
    const key = s.category?.trim() || "General Services";
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const handleOrderNow = (service) => {
    navigate(`/portal/orders?serviceId=${service.id}`);
  };

  return (
    <div>
      <div className="services-hero">
        <div className="services-hero-inner">
          <span className="services-hero-eyebrow">What we offer</span>
          <h1>Quality Tech Services, Done Right</h1>
          <p>From quick fixes to full digital solutions — find exactly what you need below.</p>
        </div>
      </div>

      <div className="portal-page" style={{ paddingTop: 30 }}>
        <div className="services-toolbar">
          <div className="toolbar-search" style={{ maxWidth: 280 }}>
            <LuSearch size={16} />
            <input type="search" placeholder="Search services…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <Loader label="Loading services…" />
        ) : filtered.length === 0 ? (
          <p className="portal-empty">No services match your search.</p>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div className="services-category-block" key={cat}>
              <h2 className="services-category-title">{cat}</h2>
              <div className="services-grid">
                {items.map((s) => (
                  <div className="service-tile" key={s.id}>
                    {s.image_url ? (
                      <div className="service-tile-image">
                        <img src={s.image_url} alt={s.name} />
                      </div>
                    ) : (
                      <div className="service-tile-icon">{(() => { const Icon = getIconFor(s); return <Icon size={22} />; })()}</div>
                    )}
                    <h3>{s.name}</h3>
                    {s.description && <p className="service-tile-desc">{s.description}</p>}
                    <div className="service-tile-footer">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => handleOrderNow(s)}>Order Now</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Testimonials */}
        <h2 className="services-category-title" style={{ marginTop: 20 }}>What Our Customers Say</h2>
        <div className="testimonial-grid">
          {TESTIMONIALS.map((t) => (
            <div className="testimonial-card" key={t.author}>
              <p className="testimonial-quote">"{t.quote}"</p>
              <p className="testimonial-author">{t.author}</p>
              <p className="testimonial-role">{t.role}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="services-category-title">Frequently Asked Questions</h2>
        <div className="portal-card" style={{ marginBottom: 30 }}>
          {FAQS.map((f, i) => (
            <div key={f.q} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="faq-question">
                {f.q}
                <LuChevronDown size={16} style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }} />
              </div>
              {openFaq === i && <p className="faq-answer">{f.a}</p>}
            </div>
          ))}
        </div>

        <div className="services-final-cta">
          <div>
            <h3>Ready to get started?</h3>
            <p>Reach out and let us know what you need — we'll take it from there.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/portal/contact")}>
            Contact Us <LuArrowRight size={16} />
          </button>
        </div>

        <div className="services-trust-strip">
          <div><LuShieldCheck size={18} /> Trusted &amp; reliable</div>
          <div><LuPhone size={18} /> Easy to reach</div>
          <div><LuSparkles size={18} /> Quality guaranteed</div>
        </div>
      </div>
    </div>
  );
}

export default Services;