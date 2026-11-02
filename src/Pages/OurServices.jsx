import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import Loader from "../Components/UI/Loader";
import "../Styles/CustomerPortal.css";

function OurServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      setServices(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const currency = (n) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="portal-page">
      <div className="portal-page-head">
        <span className="eyebrow">What we offer</span>
        <h1>Our Services</h1>
        <p>Everything HARYHORDHEYLEY Smart Tech Digital Service can help you with.</p>
      </div>

      {loading ? (
        <Loader label="Loading services…" />
      ) : services.length === 0 ? (
        <p className="portal-empty">No services listed yet — check back soon.</p>
      ) : (
        <div className="portal-service-grid">
          {services.map((s) => (
            <div className="portal-service-card" key={s.id}>
              <p className="portal-service-category">{s.category || "Service"}</p>
              <h3>{s.name}</h3>
              {s.description && <p className="portal-service-desc">{s.description}</p>}
              <p className="portal-service-price">{currency(s.price)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="portal-cta">
        <p>Interested in one of these? Reach out to us on the About Us page and we'll get you sorted.</p>
      </div>
    </div>
  );
}

export default OurServices;