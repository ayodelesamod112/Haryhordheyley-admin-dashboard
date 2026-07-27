import { Link } from "react-router-dom";
import { LuWrench, LuShieldCheck, LuClock, LuArrowRight } from "react-icons/lu";
import "../../Styles/CustomerPortal.css";

function Home() {
  return (
    <div className="portal-page">
      <div className="services-hero" style={{ borderRadius: "var(--radius-lg)", marginBottom: 30 }}>
        <div className="services-hero-inner">
          <span className="services-hero-eyebrow">HARYHORDHEYLEY Smart Tech Digital Service</span>
          <h1>Reliable tech services, done right.</h1>
          <p>From repairs to full digital solutions — we've got you covered.</p>
          <div style={{ marginTop: 20 }}>
            <Link to="/portal/services" className="btn btn-primary">Explore Services <LuArrowRight size={15} /></Link>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="portal-card">
          <LuWrench size={22} style={{ color: "var(--color-yellow-deep)", marginBottom: 10 }} />
          <h4>Expert Work</h4>
          <p>Every job handled by people who know what they're doing.</p>
        </div>
        <div className="portal-card">
          <LuClock size={22} style={{ color: "var(--color-yellow-deep)", marginBottom: 10 }} />
          <h4>Fast Turnaround</h4>
          <p>We respect your time — most jobs move quickly.</p>
        </div>
        <div className="portal-card">
          <LuShieldCheck size={22} style={{ color: "var(--color-yellow-deep)", marginBottom: 10 }} />
          <h4>Trusted &amp; Secure</h4>
          <p>Your orders and payments are tracked every step of the way.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;